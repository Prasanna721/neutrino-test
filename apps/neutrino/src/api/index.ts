import { chromium, Browser, BrowserContext, Page } from "playwright";
import { TestSuite } from "./interfaces.js";
import {
  getScreenDimensions,
  processCurrentView,
  verifyTask,
} from "./utils.js";
import { executeAction } from "../actions.js";
import { screenshotDIR, screenshotPath, VAR_SUCCESS } from "../constants.js";
import { addBrowserActions, clearFolder, handleLogs } from "../utils/helper.js";
import { createLogMessage, LogPublisher } from "../services/logHandler.js";
import { PodLogHandler, createDBLogMessage } from "../services/dbHandler.js";
import { SupabaseDB } from "@neutrino-package/supabase";
import {
  LogLevel,
  PodStatus,
  BrowserActionType,
  TaskStatus,
} from "@neutrino-package/supabase/types";
import { createSupabaseClient } from "@neutrino-package/supabase/config";

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
    dimensions: any,
    j: number
  ): Promise<{ success: boolean; j: number }> {
    // Take the first screenshot before processing the task.
    const path1 = screenshotPath(this.dockerJobName, j++);
    await page.screenshot({ path: path1 });

    // Process the current view to determine the action.
    const action = await processCurrentView(task, dimensions, path1);
    if (this.isLogPublisherActive) {
      await LogPublisher.publish(
        this.dockerJobName,
        createLogMessage(LogLevel.INFO, "Action processed", { action })
      );
    }
    await this.podLogHandler.info(this.podId!, "action", { action });
    console.log(action);

    // Execute the determined action.
    await executeAction(page, action);
    await page.waitForTimeout(5000);

    // Capture a screenshot after the action.
    const path2 = screenshotPath(this.dockerJobName, j++);
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

    // Verify the action execution.
    const verifyActionRes = await verifyTask(task, action, path1, path2);
    if (this.isLogPublisherActive) {
      await LogPublisher.publish(
        this.dockerJobName,
        createLogMessage(LogLevel.INFO, "verify action", { verifyActionRes })
      );
    }
    await this.podLogHandler.info(this.podId!, "verify_action", {
      verifyActionRes,
    });
    console.log(verifyActionRes);

    const isTaskExecuted = verifyActionRes.status === VAR_SUCCESS;
    return { success: isTaskExecuted, j };
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

    this.browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await this.browser.newContext({
      recordVideo: {
        dir: screenshotDIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page: Page = await context.newPage();
    const dimensions = await getScreenDimensions(page);

    try {
      let j = 0;
      let i = 0;
      while (i < this.testSuite.length) {
        const currentTask = this.testSuite[i]!;
        if ((this.testStepsFlow[i] ?? 0) >= MAX_RETRIES) {
          throw new Error(`Task ${i} failed after ${MAX_RETRIES} attempts.`);
        }

        const { success, j: newJ } = await this.executeTask(
          page,
          currentTask,
          dimensions,
          j
        );
        j = newJ;

        if (!success) {
          this.testStepsFlow[i] = (this.testStepsFlow[i] ?? 0) + 1;
          const retryWarn = `Retrying task ${this.testSuite[i]}, attempt ${this.testStepsFlow[i]}`;
          console.warn(retryWarn);
          this.podLogHandler.warn(this.podId!, "retry_task", {
            message: retryWarn,
          });
        } else {
          i++;
        }

        await page.waitForTimeout(1000);
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
