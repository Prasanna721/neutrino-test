// app/requests/api.ts
import { Requests } from "./request";
import { ApiRunTestInterface } from "@/interfaces/apiResponse";

/**
 * Sends a POST request to start the test/job.
 * @param testId A unique test identifier.
 */
export async function runTestSuite(jobId: string, testId: string) {
  const response: ApiRunTestInterface = await Requests.post(
    "/api/runtests",
    { jobId, testId },
    true
  );
  if (response.status >= 400) {
    throw new Error(response.error);
  }
  return response;
}

/**
 * Creates an EventSource to watch logs from a given jobName.
 * @param jobName The Kubernetes job name returned from `runTestSuite`.
 * @returns An EventSource instance that you can attach onmessage/onerror handlers to.
 */
export async function watchLogs(jobName: string) {
  const data = await Requests.get(`/api/testsuite/${jobName}`, false);
  return data;
}

/**
 * Sends a DELETE request to stop the test/job.
 * @param jobName The Kubernetes job name returned from `runTestSuite`.
 */
export async function terminateTestSuite(jobName: string) {
  const data = await Requests.delete(`/api/testsuite/${jobName}`, false);
  return data;
}
