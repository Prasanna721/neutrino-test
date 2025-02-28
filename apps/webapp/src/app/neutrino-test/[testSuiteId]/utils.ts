import { formatDate } from "@/app/utils";
import { CHIPVIEW_CONSTANTS } from "@/components/constants";
import { Log, TaskStatus } from "@neutrino-package/supabase/types";

export const getChipViewStylebyTaskStatus = (
  taskStatus: TaskStatus | undefined
) => {
  if (taskStatus === TaskStatus.SUCCESS) {
    return CHIPVIEW_CONSTANTS.success;
  } else if (taskStatus === TaskStatus.FAILED) {
    return CHIPVIEW_CONSTANTS.error;
  } else if (taskStatus === TaskStatus.CANCELLED) {
    return CHIPVIEW_CONSTANTS.warn;
  } else {
    return CHIPVIEW_CONSTANTS.info;
  }
};

export const getStatusColor = (taskStatus: TaskStatus | undefined) => {
  if (taskStatus === TaskStatus.SUCCESS) {
    return "bg-green-500";
  } else if (taskStatus === TaskStatus.FAILED) {
    return "bg-red-500";
  } else if (taskStatus === TaskStatus.CANCELLED) {
    return "bg-yellow-500";
  } else {
    return "bg-blue-500";
  }
};

export const getStatusEmoji = (taskStatus: TaskStatus | undefined): string => {
  if (taskStatus === TaskStatus.SUCCESS) {
    return "✅";
  } else if (taskStatus === TaskStatus.FAILED) {
    return "❌";
  } else if (taskStatus === TaskStatus.CANCELLED) {
    return "⚠️";
  } else {
    return "🌀";
  }
};

export function formatLogs(logs: Log[]): string[] {
  return logs.map((log) => {
    const date = new Date(log.timestamp);
    const formattedDate = formatDate(date);
    const level = log.level.toUpperCase();

    const metaObj = log.meta || {};
    const metaStr =
      Object.keys(metaObj).length > 0
        ? "\n" + JSON.stringify(metaObj, null, 2)
        : "";

    return `[${formattedDate} - ${level}] ${log.message}${metaStr}`;
  });
}
