"use server";

import { TestContainer, TestSuite } from "@/types/testSuiteTypes";
import { SupabaseDB } from "@neutrino-package/supabase";
import { createSupabaseClient } from "@neutrino-package/supabase/config";
import { TestSuiteListItem } from "@/app/neutrino-test/[testSuiteId]/components/TestSuiteListComponent";
import {
  Log,
  Pod,
  PodDeploymentEnv,
  PodStatus,
  BrowserAction,
  TaskStatus,
  TestsuiteConfig,
} from "@neutrino-package/supabase/types";
import { ConfigItem } from "@/app/neutrino-test/[testSuiteId]/views/ConfigsTab";

export const createTestSuite = async (
  name: string,
  description: string
): Promise<TestSuite> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const ts = await db.createTestsuite({
    user_id: undefined,
    name: name,
    description: description,
  });
  const testSuite: TestSuite = {
    testSuiteId: ts.id,
    name: ts.name,
    description: ts.description || "",
    testRuns: [],
    testSuiteConfigs: [],
    created_at: new Date(ts.created_at),
    updated_at: new Date(ts.updated_at),
  };
  return testSuite;
};

export const getTestSuite = async (
  testSuiteId: string
): Promise<TestSuite | null> => {
  try {
    const supabaseClient = createSupabaseClient();
    const db = new SupabaseDB(supabaseClient);
    const ts = await db.getTestsuite(testSuiteId);
    const testRuns: Pod[] = await db.getPodsByTestsuite(testSuiteId);
    const testRunTransformed: TestContainer[] = testRuns.map((pod: Pod) => {
      const testRun: TestContainer = {
        podId: pod.id,
        podStatus: pod.status,
        taskStatus: pod.task_status,
        environment: pod.environment,
        dockerContainerId: pod.docker_container_id,
        dockerImage: pod.docker_image,
        testsuiteConfigs: pod.testsuite_configs,
        jobName: pod.jobname,
        errorMessage: pod.error_message,
        createdTime: new Date(pod.created_at),
        startTime: new Date(pod.started_at),
        endTime: pod.finished_at ? new Date(pod.finished_at) : null,
      };
      return testRun;
    });
    const testsuiteConfigs: TestsuiteConfig[] = await fetchTestsuiteConfig(
      testSuiteId
    );
    const testSuiteConfigTransformed: ConfigItem[] = testsuiteConfigs.map(
      (config) => ({
        key: config.key,
        value: config.value,
        created_at: new Date(config.created_on),
      })
    );
    const testSuite: TestSuite = {
      testSuiteId: ts.id,
      name: ts.name,
      description: ts.description || "",
      testRuns: testRunTransformed,
      testSuiteConfigs: testSuiteConfigTransformed,
      created_at: new Date(ts.created_at),
      updated_at: new Date(ts.updated_at),
    };

    return testSuite;
  } catch (e) {
    console.log("TestSuite not found");
    return null;
  }
};

export const getAllTestSuites = async (): Promise<TestSuite[]> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const testSuites = await db.getAllTestsuite();
  let testSuitesTransformed: TestSuite[] = [];
  for (let i = 0; i < testSuites.length; i++) {
    const testSuite = await getTestSuite(testSuites[i].id);
    if (testSuite) {
      testSuitesTransformed.push(testSuite);
    }
  }
  return testSuitesTransformed;
};

export const getTestSuiteTasks = async (
  testSuiteId: string
): Promise<TestSuiteListItem[]> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const tasks = await db.getTasksByTestsuite(testSuiteId);
  const testSuiteTasks: TestSuiteListItem[] = tasks
    .sort((a, b) => a.order_index - b.order_index)
    .map((task) => ({
      id: task.id,
      order_index: task.order_index,
      text: task.description,
    }));

  return testSuiteTasks;
};

export const addTestSuiteTask = async (
  testSuiteId: string,
  taskDescription: string
): Promise<TestSuiteListItem> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const task = await db.createTask({
    testsuite_id: testSuiteId,
    description: taskDescription,
  });
  const testSuiteTask: TestSuiteListItem = {
    id: task.id,
    order_index: task.order_index,
    text: task.description,
  };
  return testSuiteTask;
};

export const deleteTestSuiteTask = async (taskId: number): Promise<void> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  await db.deleteTask(taskId);
};

export const addNeutrinoJobDetails = async (
  testSuiteId: string,
  jobname: string
): Promise<number> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);

  const pod: Partial<Pod> = {
    testsuite_id: testSuiteId,
    status: PodStatus.STARTING,
    task_status: TaskStatus.PROGESS,
    jobname: jobname,
    environment: PodDeploymentEnv.PREVIEW,
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
  };

  const podDetails = await db.createPod(pod);
  return podDetails.id;
};

export const updateNeutrinoJobDetails = async (
  podId: number,
  updateData: Partial<Pod>
): Promise<void> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);

  await db.updatePod(podId, updateData);
};

export const updateNeutrinoJobDetailsByJobName = async (
  jobName: string,
  updateData: Partial<Pod>
): Promise<void> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);

  await db.updatePodByJobName(jobName, updateData);
};

export const getPodDetails = async (jobName: string): Promise<Pod> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const pod = await db.getPodByJobName(jobName);
  return pod;
};

export const getPodLogs = async (podId: number): Promise<Log[]> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const logs = await db.getLogsByPod(podId);
  return logs;
};

export const getBrowserActionsByJobName = async (
  jobName: string
): Promise<BrowserAction[]> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const BrowserActionRecord = await db.getBrowserActionsByJobName(jobName);
  return BrowserActionRecord;
};

export const getRecentBrowserAction =
  async (): Promise<BrowserAction | null> => {
    const supabaseClient = createSupabaseClient();
    const db = new SupabaseDB(supabaseClient);
    const BrowserActionRecord = await db.getRecentBrowserAction();
    return BrowserActionRecord;
  };

export const getBrowserActionUrl = async (
  filePath: string
): Promise<string> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const signedUrl = await db.getBrowserActionFromBucket(filePath);
  return signedUrl;
};

export const addTestsuiteConfig = async (
  testSuiteId: string,
  configKey: string,
  configValue: string
): Promise<Partial<TestsuiteConfig>> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const config: Partial<TestsuiteConfig> = {
    testsuite_id: testSuiteId,
    key: configKey,
    value: configValue,
  };
  const configDetails = await db.addTestsuiteConfig(config);
  return configDetails;
};

export const fetchTestsuiteConfig = async (
  testSuiteId: string
): Promise<TestsuiteConfig[]> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  const configDetails = await db.getTestsuiteConfigs(testSuiteId);
  return configDetails;
};

export const deleteTestsuiteConfig = async (
  testSuiteId: string,
  configKey: string
): Promise<void> => {
  const supabaseClient = createSupabaseClient();
  const db = new SupabaseDB(supabaseClient);
  await db.deleteTestsuiteConfig(testSuiteId, configKey);
};
