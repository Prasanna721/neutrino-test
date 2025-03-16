import { SupabaseDB } from "@neutrino-package/supabase";
import { LogLevel } from "@neutrino-package/supabase/types";

export interface DBLogMessage {
  timestamp: number;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

export const createDBLogMessage = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): DBLogMessage => {
  return {
    timestamp: Date.now(),
    level,
    message,
    meta,
  };
};

export class PodLogHandler {
  private static instance: PodLogHandler;
  private db: SupabaseDB;

  /**
   * Creates a new instance of PodLogHandler.
   * @param db An instance of SupabaseDB.
   */
  private constructor(db: SupabaseDB) {
    this.db = db;
  }

  /**
   * Returns the singleton instance of PodLogHandler.
   * @param db An instance of SupabaseDB. (Used only on first initialization.)
   */
  public static getInstance(db: SupabaseDB): PodLogHandler {
    if (!PodLogHandler.instance) {
      PodLogHandler.instance = new PodLogHandler(db);
    }
    return PodLogHandler.instance;
  }

  /**
   * Saves a log message for a given pod.
   * Converts the numeric timestamp to an ISO string (which is expected by the DB).
   * @param podId The ID of the pod.
   * @param log The log message to save.
   */
  public async savePodLog(podId: number, log: DBLogMessage): Promise<void> {
    try {
      await this.db.createLog({
        pod_id: podId,
        timestamp: new Date(log.timestamp).toISOString(),
        level: log.level as any,
        message: log.message,
        meta: log.meta,
      });
      console.log(`Saved log for pod ${podId}`);
    } catch (error) {
      console.error("Error saving pod log:", error);
      throw error;
    }
  }

  public async debug(
    podId: number,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    await this.savePodLog(
      podId,
      createDBLogMessage(LogLevel.DEBUG, message, meta)
    );
  }

  public async info(
    podId: number,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    await this.savePodLog(
      podId,
      createDBLogMessage(LogLevel.INFO, message, meta)
    );
  }

  public async warn(
    podId: number,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    await this.savePodLog(
      podId,
      createDBLogMessage(LogLevel.WARN, message, meta)
    );
  }

  public async error(
    podId: number,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    await this.savePodLog(
      podId,
      createDBLogMessage(LogLevel.ERROR, message, meta)
    );
  }
}
