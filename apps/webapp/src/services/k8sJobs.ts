import {
  KubeConfig,
  BatchV1Api,
  CoreV1Api,
  Log,
} from "@kubernetes/client-node";
import Stream from "stream";
import { ExtractedPodInfo, extractPodInfo } from "./utils";
import {
  addNeutrinoJobDetails,
  getPodDetails,
  updateNeutrinoJobDetails,
  updateNeutrinoJobDetailsByJobName,
} from "@/lib/dbhelper";
import { PodStatus, TaskStatus } from "@neutrino-package/supabase/types";
import { delay } from "@/app/utils";

const kc = new KubeConfig();
kc.loadFromDefault(); // or loadFromFile("path/to/kubeconfig")

const batchApi = kc.makeApiClient(BatchV1Api);
const coreApi = kc.makeApiClient(CoreV1Api);
const k8sLog = new Log(kc);

export interface JobDetails {
  podId: number;
  jobName: string;
}

export async function createNeutrinoJob(
  jobId: string,
  testId: string
): Promise<JobDetails> {
  const jobName = `neutrino-test-${jobId}`;

  const jobManifest = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: { name: jobName },
    spec: {
      ttlSecondsAfterFinished: 3600,
      template: {
        spec: {
          restartPolicy: "Never",
          containers: [
            {
              name: "neutrino",
              image: "neutrino-neutrino:latest",
              imagePullPolicy: "IfNotPresent",
              command: ["node", "build/app.js"],
              env: [
                { name: "TESTSUITE_ID", value: testId },
                { name: "JOB_NAME", value: jobName },
                { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY },
                { name: "CLAUDE_API_KEY", value: process.env.CLAUDE_API_KEY },
                { name: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY },
                { name: "SUPABASE_URL", value: process.env.SUPABASE_URL },
                { name: "SUPABASE_KEY", value: process.env.SUPABASE_KEY },
              ],
            },
          ],
        },
      },
    },
  };

  const podId = await addNeutrinoJobDetails(testId, jobName);
  let createResponse;
  try {
    createResponse = await batchApi.createNamespacedJob({
      namespace: "default",
      body: jobManifest,
    });
    await updateNeutrinoJobDetails(podId, {
      status: PodStatus.RUNNING,
      docker_container_id: createResponse.metadata?.name || "",
      docker_image:
        createResponse.spec?.template.spec?.containers[0].image || "",
      host:
        createResponse.spec?.template.spec?.containers[0].command?.[0] || "",
    });
  } catch (err: any) {
    updateNeutrinoJobDetailsByJobName(jobName, {
      status: PodStatus.ERROR,
      task_status: TaskStatus.FAILED,
      finished_at: new Date().toISOString(),
      error_message: err.message,
    });
    throw err;
  }

  console.log(`Job created: ${createResponse.metadata?.name}`);
  return { podId, jobName };
}

export async function getPodNameForJob(
  jobName: string
): Promise<string | null> {
  const pods = await coreApi.listNamespacedPod({
    namespace: "default",
    labelSelector: `job-name=${jobName}`,
  });

  if (!pods.items.length) {
    return null;
  }
  return pods.items[0].metadata?.name || null;
}

export async function streamPodLogs(
  podName: string,
  onData: (line: string) => void
) {
  const logStream = new Stream.PassThrough();
  logStream.on("data", (chunk) => {
    onData(chunk.toString());
  });

  await k8sLog.log("default", podName, "neutrino", logStream, {
    follow: true,
    tailLines: 100,
  });
}

export async function getPodLogs(podName: string): Promise<string> {
  try {
    const logs = await coreApi.readNamespacedPodLog({
      name: podName,
      namespace: "default",
      container: "neutrino",
    });
    return logs;
  } catch (err) {
    console.error("Error reading pod logs:", err);
    return "";
  }
}

export async function getPodInfo(
  podName: string
): Promise<ExtractedPodInfo | null> {
  try {
    const response = await coreApi.readNamespacedPod({
      name: podName,
      namespace: "default",
    });

    return extractPodInfo(response);
  } catch (err) {
    console.error("Error reading pod info:", err);
    return null;
  }
}

export async function deletePod(
  podName: string,
  jobName: string
): Promise<boolean> {
  try {
    const podDetails = await getPodDetails(jobName);
    await updateNeutrinoJobDetails(podDetails.id, {
      status: PodStatus.TERMINATING,
      task_status: TaskStatus.CANCELLED,
    });
    await batchApi.deleteNamespacedJob({
      name: jobName,
      namespace: "default",
      body: {
        propagationPolicy: "Foreground",
      },
    });

    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const pods = await coreApi.listNamespacedPod({
        namespace: "default",
        labelSelector: `job-name=${jobName}`,
      });
      if (pods.items.length === 0) {
        console.log("All pods deleted");
        break;
      }
      console.log("Waiting for pods to terminate...");
      await delay(2000);
      attempts++;
    }

    if (attempts === maxAttempts) {
      console.error("Pods were not deleted after waiting.");
      return false;
    }
    await updateNeutrinoJobDetails(podDetails.id, {
      status: PodStatus.STOPPED,
      task_status: TaskStatus.CANCELLED,
      finished_at: new Date().toISOString(),
    });

    return true;
  } catch (err) {
    console.error("Error deleting pod:", err);
    return false;
  }
}
