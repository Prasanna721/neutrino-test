import { SupabaseDB } from "@neutrino-package/supabase";
import * as fs from "fs";
import * as path from "path";
import { promises as fsPromise } from "fs";
import {
  LogLevel,
  BrowserAction,
  BrowserActionType,
} from "@neutrino-package/supabase/types";
import { createDBLogMessage, PodLogHandler } from "../services/dbHandler.js";

export function clearFolder(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  } else {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

export const generateJobId = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return hex.slice(0, 12);
};

export const addBrowserActions = async (
  db: SupabaseDB,
  dockerJobName: string,
  podId: number,
  filePath: string,
  pageUrl: string,
  mime_type: string,
  image_type: BrowserActionType,
  details: {}
) => {
  const fileBuffer = await fsPromise.readFile(filePath);
  const fileBlob = new Blob([fileBuffer], { type: "image/png" });
  const imageMetadata: Partial<BrowserAction> = {
    jobname: dockerJobName,
    file_name: filePath.split("/").pop() || "screenshot.png",
    pod_id: podId,
    page_url: pageUrl,
    mime_type: mime_type,
    image_type: image_type,
    details: details,
  };
  await db.createBrowserAction(imageMetadata, fileBlob);
};

export const handleLogs = (
  db: SupabaseDB,
  podLogHandler: PodLogHandler,
  podId: number | null
) => {
  if (podId) {
    process.on("uncaughtException", async (error) => {
      podLogHandler.savePodLog(
        podId,
        createDBLogMessage(LogLevel.ERROR, "uncaught_exception", {
          message: error.message,
          stack: error.stack,
        })
      );
    });

    process.on("unhandledRejection", async (reason, promise) => {
      podLogHandler.savePodLog(
        podId,
        createDBLogMessage(LogLevel.ERROR, "uncaught_rejection", {
          message: reason,
          stack: promise,
        })
      );
    });
  }
};
