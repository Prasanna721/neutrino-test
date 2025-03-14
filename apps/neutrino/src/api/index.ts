import { chromium } from "playwright";
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

export class API {
  private dockerJobName: string;
  private podId: number | null = null;
  private testSuiteId: string;
  private testSuite: TestSuite | null = null;
  private db: SupabaseDB;
  private browser: any;
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

  async initPodDetails() {
    const podDetails = await this.db.getPodByJobName(this.dockerJobName);
    this.podId = podDetails.id;
  }

  async initTestSuite() {
    const tasks = await this.db.getTasksByTestsuite(this.testSuiteId);
    this.testSuite = tasks
      .sort((a, b) => a.order_index - b.order_index)
      .map((task) => task.description);
  }

  async startTest() {
    !this.testSuite && (await this.initTestSuite());
    !this.podId && (await this.initPodDetails());

    handleLogs(this.db, this.podLogHandler, this.podId);

    if (!this.testSuite || !this.podId) {
      throw new Error("Error starting the test");
    }

    this.browser = await chromium.launch({
      headless: true,
    });

    const context = await this.browser.newContext({
      recordVideo: {
        dir: screenshotDIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page = await context.newPage();

    const dimensions = await getScreenDimensions(page);

    try {
      var j = 0;
      for (let i = 0; i < this.testSuite.length; i++) {
        const path = screenshotPath(this.dockerJobName, j++);
        await page.screenshot({ path: path });

        const action = await processCurrentView(
          this.testSuite[i] || "",
          dimensions,
          path
        );
        this.isLogPublisherActive &&
          (await LogPublisher.publish(
            this.dockerJobName,
            createLogMessage(LogLevel.INFO, "Action processed", { action })
          ));
        await this.podLogHandler.savePodLog(
          this.podId,
          createDBLogMessage(LogLevel.INFO, "action", { action })
        );
        console.log(action);

        await executeAction(page, action);
        await page.waitForTimeout(5000);

        await page.screenshot({
          path: screenshotPath(this.dockerJobName, j++),
        });

        const currentUrl = await page.url();
        const mime_type = "image/png";
        await addBrowserActions(
          this.db,
          this.dockerJobName,
          this.podId,
          screenshotPath(this.dockerJobName, j - 1),
          currentUrl,
          mime_type,
          BrowserActionType.TASK,
          { task: this.testSuite[i], action }
        );

        const verifyActionRes = await verifyTask(
          this.testSuite[i] || "",
          action,
          screenshotPath(this.dockerJobName, j - 2),
          screenshotPath(this.dockerJobName, j - 1)
        );
        this.isLogPublisherActive &&
          (await LogPublisher.publish(
            this.dockerJobName,
            createLogMessage(LogLevel.INFO, "verify action", {
              verifyActionRes,
            })
          ));
        await this.podLogHandler.savePodLog(
          this.podId,
          createDBLogMessage(LogLevel.INFO, "verify_action", {
            verifyActionRes,
          })
        );
        console.log(verifyActionRes);

        const isTaskExecuted = verifyActionRes.status == VAR_SUCCESS;
        if (!isTaskExecuted) {
          i--;
        }

        await page.waitForTimeout(1000);
      }
      await this.db.updatePod(this.podId, {
        status: PodStatus.STOPPED,
        task_status: TaskStatus.SUCCESS,
        finished_at: new Date().toISOString(),
      });
    } catch (error) {
      this.isLogPublisherActive &&
        (await LogPublisher.publish(
          this.dockerJobName,
          createLogMessage(LogLevel.ERROR, "Error during test execution", {
            error,
          })
        ));
      await this.podLogHandler.savePodLog(
        this.podId,
        createDBLogMessage(LogLevel.ERROR, "exec_error", { error: error })
      );
      await this.db.updatePod(this.podId, {
        status: PodStatus.STOPPED,
        task_status: TaskStatus.FAILED,
        finished_at: new Date().toISOString(),
        error_message: String(error),
      });
      console.error("Error during test execution:", error);
    } finally {
      await this.browser.close();

      const videoPath = await page.video()?.path();
      await addBrowserActions(
        this.db,
        this.dockerJobName,
        this.podId,
        videoPath,
        "",
        "video/webm",
        BrowserActionType.VIDEO,
        { task: "final_video" }
      );
    }
  }
}
