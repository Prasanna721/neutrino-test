import { chromium, Browser, BrowserContext, Page } from "playwright";
import { SupabaseDB } from "@neutrino-package/supabase";
import {
  LogLevel,
  PodStatus,
  BrowserActionType,
  TaskStatus,
} from "@neutrino-package/supabase/types";
import { createSupabaseClient } from "@neutrino-package/supabase/config";
import { screenshotDIR, screenshotPath } from "../../constants.js";
import {
  addBrowserActions,
  clearFolder,
  handleLogs,
} from "../../utils/helper.js";
import { PodLogHandler } from "../../services/dbHandler.js";
import {
  evaluateTestStepFlow,
  generateTestStepFlow,
  getScreenDimensions,
  processCurrentView,
} from "../utils.js";
import { createLogMessage, LogPublisher } from "../../services/logHandler.js";
import { executeAction } from "../../actions.js";
import { improveBrowserVisibility } from "../../browser/utils.js";
import AnthropicAdapter, { ANTHROPIC_MODEL } from "../../drivers/anthropic.js";
import { ChatAnthropic } from "@langchain/anthropic";

// Maximum number of allowed retries per task
const MAX_RETRIES = 4;

export class API {
  private dockerJobName: string;
  private podId: number | null = null;
  private testSuiteId: string;
  private testSuite: string[] | null = null;
  private testStepsFlow: number[] = [];
  private db: SupabaseDB;
  private browser!: Browser;
  private isLogPublisherActive: boolean = true;
  private podLogHandler: PodLogHandler;
  private browserViewLogCount: number = 0;
  private stepFlowChat: ChatAnthropic | null = null;

  constructor(
    dockerJobName: string,
    testSuiteId: string,
    isLogPublisherActive: boolean
  ) {
    const supabaseClient = createSupabaseClient();
    this.db = new SupabaseDB(supabaseClient);
    this.testSuiteId = testSuiteId;
    this.dockerJobName = dockerJobName;
    this.isLogPublisherActive = isLogPublisherActive;
    this.podLogHandler = PodLogHandler.getInstance(this.db);
    clearFolder(screenshotDIR);
  }

  /**
   * Initialize the pod details by fetching the pod ID.
   */
  async initPodDetails(): Promise<void> {
    const podDetails = await this.db.getPodByJobName(this.dockerJobName);
    this.podId = podDetails.id;
  }

  /**
   * Initializes the test suite and corresponding retry flow.
   */
  async initTestSuite(): Promise<void> {
    const tasks = await this.db.getTasksByTestsuite(this.testSuiteId);
    this.testSuite = tasks
      .sort((a, b) => a.order_index - b.order_index)
      .map((task) => task.description);
    this.testStepsFlow = new Array(this.testSuite.length).fill(0);
  }

  /**
   * Executes a single task and returns whether it was successful,
   * along with the updated screenshot counter.
   * @param page - The Playwright page instance.
   * @param task - The task description.
   * @param dimensions - The current screen dimensions.
   * @param j - The current screenshot counter.
   * @returns An object containing the success flag and updated screenshot counter.
   */
  private async executeTask(
    page: Page,
    task: string,
    testStepFlow: { [tag: string]: string },
    dimensions: any
  ): Promise<{ [tag: string]: string }> {
    // Take the first screenshot before processing the task.
    const path1 = screenshotPath(
      this.dockerJobName,
      this.browserViewLogCount - 1
    );

    const images: string[] = [path1];
    if (this.browserViewLogCount - 2 >= 0) {
      images.unshift(
        screenshotPath(this.dockerJobName, this.browserViewLogCount - 2)
      );
    }
    console.log(images);
    const testStepFlowEvals = await evaluateTestStepFlow(
      this.stepFlowChat!,
      {
        test_step_analysis: testStepFlow.test_step_analysis || "",
        visual_steps: testStepFlow.visual_steps || "",
        action_steps: testStepFlow.action_steps || "",
        execution_notes: testStepFlow.execution_notes || "",
        next_step: testStepFlow.next_step || "",
      },
      dimensions,
      images
    );

    console.log(testStepFlowEvals);
    let testStepResponse;
    if (testStepFlowEvals.test_step_response) {
      testStepResponse = JSON.parse(testStepFlowEvals.test_step_response);
    }
    if (testStepResponse.status != "complete" && testStepFlowEvals.action!) {
      const action = JSON.parse(testStepFlowEvals.action);

      // Execute the determined action.
      await executeAction(page, action);
      await page.waitForTimeout(5000);

      // Capture a screenshot after the action.
      const path2 = screenshotPath(
        this.dockerJobName,
        this.browserViewLogCount++
      );
      await page.screenshot({ path: path2 });

      // Record the browser action.
      const currentUrl = await page.url();
      const mime_type = "image/png";
      await addBrowserActions(
        this.db,
        this.dockerJobName,
        this.podId!,
        path2,
        currentUrl,
        mime_type,
        BrowserActionType.TASK,
        { task, action }
      );
    }

    return testStepFlowEvals;
  }

  /**
   * Starts the test suite by launching the browser, processing each task,
   * and handling retries if needed.
   */
  async startTest(): Promise<void> {
    if (!this.testSuite) {
      await this.initTestSuite();
    }
    if (!this.podId) {
      await this.initPodDetails();
    }

    handleLogs(this.db, this.podLogHandler, this.podId);

    if (!this.testSuite || !this.podId) {
      throw new Error("Error starting the test");
    }

    this.browser = await chromium.launch({ headless: true });
    const context: BrowserContext = await this.browser.newContext({
      recordVideo: {
        dir: screenshotDIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page: Page = await context.newPage();
    const dimensions = await getScreenDimensions(page);
    const testStepChat = await AnthropicAdapter.getModel(
      ANTHROPIC_MODEL.sonnet,
      true
    );
    this.stepFlowChat = await AnthropicAdapter.getModel(
      ANTHROPIC_MODEL.sonnet,
      true
    );

    try {
      for (let i = 0; i < this.testSuite.length; i++) {
        const testStep = this.testSuite[i]!;
        this.testStepsFlow[i] = 0;

        await improveBrowserVisibility(page);
        const path = screenshotPath(
          this.dockerJobName,
          this.browserViewLogCount++
        );
        await page.screenshot({ path: path });

        const testStepFlow = await generateTestStepFlow(
          testStepChat,
          testStep,
          path
        );
        if (i < this.testSuite.length - 1) {
          testStepFlow.next_step = this.testSuite[i + 1]! || "";
        }
        if (this.isLogPublisherActive) {
          await LogPublisher.publish(
            this.dockerJobName,
            createLogMessage(LogLevel.INFO, "TestStepFlow processed", {
              testStepFlow,
            })
          );
        }
        await this.podLogHandler.info(this.podId!, "test_step_flow", {
          testStepFlow,
        });
        console.log(testStepFlow);

        while (this.testStepsFlow[i]! < MAX_RETRIES) {
          const testStepFlowEvals = await this.executeTask(
            page,
            testStep,
            testStepFlow,
            dimensions
          );
          if (testStepFlowEvals.action) {
            const action = JSON.parse(testStepFlowEvals.action);
            if (action.task_type) {
              testStepFlow.previous_action = testStepFlowEvals.action;
            }
          }
          //   console.log(testStepFlowEvals);

          if (this.isLogPublisherActive) {
            await LogPublisher.publish(
              this.dockerJobName,
              createLogMessage(LogLevel.INFO, "TestStepFlow eval", {
                testStepFlowEvals,
              })
            );
          }
          await this.podLogHandler.info(this.podId!, "test_step_flow_eval", {
            testStepFlowEvals,
          });

          if (testStepFlowEvals.error) {
            const testStepError = JSON.parse(testStepFlowEvals.error);
            if (testStepError.err_type) {
              throw new Error(testStepError.toString());
            }
          }

          if (testStepFlowEvals.test_step_response!) {
            const testStepResponse = JSON.parse(
              testStepFlowEvals.test_step_response
            );
            if (testStepResponse.status === "complete") {
              break;
            } else if (testStepResponse.status === "failed") {
              throw new Error(testStepResponse.message);
            }
          }

          if (testStepFlowEvals.visual_steps) {
            testStepFlow.visual_steps = testStepFlowEvals.visual_steps;
          }

          if (testStepFlowEvals.action_steps) {
            testStepFlow.action_steps = testStepFlowEvals.action_steps;
          }

          this.testStepsFlow[i] = (this.testStepsFlow[i] ?? 0) + 1;
          const retryWarn = `Retrying task ${this.testSuite[i]}, attempt ${this.testStepsFlow[i]}`;
          console.warn(retryWarn);
          this.podLogHandler.warn(this.podId!, "retry_task", {
            message: retryWarn,
          });
        }
        if (this.testStepsFlow[i]! >= MAX_RETRIES) {
          throw new Error(`Task ${i} failed after ${MAX_RETRIES} attempts.`);
        }
      }

      await this.db.updatePod(this.podId, {
        status: PodStatus.STOPPED,
        task_status: TaskStatus.SUCCESS,
        finished_at: new Date().toISOString(),
      });
    } catch (error) {
      if (this.isLogPublisherActive) {
        await LogPublisher.publish(
          this.dockerJobName,
          createLogMessage(LogLevel.ERROR, "Error during test execution", {
            error,
          })
        );
      }
      await this.podLogHandler.error(this.podId!, "exec_error", {
        error: String(error),
      });
      await this.db.updatePod(this.podId, {
        status: PodStatus.STOPPED,
        task_status: TaskStatus.FAILED,
        finished_at: new Date().toISOString(),
        error_message: String(error),
      });
      console.error("Error during test execution:", error);
    } finally {
      await this.browser.close();
      const videoPath: string = (await page.video()?.path()) || "";
      await addBrowserActions(
        this.db,
        this.dockerJobName,
        this.podId!,
        videoPath,
        "",
        "video/webm",
        BrowserActionType.VIDEO,
        { task: "final_video" }
      );
    }
  }
}
