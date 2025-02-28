export const generateTestId = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return hex.slice(0, 12);
};

export const getPassedTimeAsString = (
  date: Date | undefined | null
): string => {
  if (!date) {
    return "";
  }
  const now = new Date().getTime();
  const past =
    typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
};

export const getDurationString = (
  startTime: Date | null,
  endTime: Date | null
): string => {
  if (startTime === null || endTime === null) {
    return "Unknown";
  }

  let ms = endTime.getTime() - startTime.getTime();
  if (ms < 0) {
    ms = 0;
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}min`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.length > 0 ? parts.join(" ") : "0s";
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function formatDate(date: Date | null): string {
  if (date === null) {
    return "NaN";
  }
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${hours}:${formattedMinutes}${ampm} ${day} ${month}, ${year}`;
}
