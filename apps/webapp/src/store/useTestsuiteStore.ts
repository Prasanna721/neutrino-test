import { getPodDetails, getTestSuite } from "@/lib/dbhelper";
import { TestContainer, TestSuite } from "@/types/testSuiteTypes";
import {
  PodStatus,
  PodDeploymentEnv,
  TaskStatus,
  Pod,
} from "@neutrino-package/supabase/types";
import test from "node:test";
import { create } from "zustand";

const initialTestRun: TestContainer = {
  jobName: "",
  podId: null,
  podStatus: PodStatus.STOPPED,
  taskStatus: TaskStatus.PROGESS,
  dockerContainerId: "",
  dockerImage: "",
  errorMessage: "",
  createdTime: new Date(),
  startTime: new Date(),
  endTime: null,
  environment: PodDeploymentEnv.PREVIEW,
};

const initialTestSuite: TestSuite = {
  testSuiteId: "",
  name: "",
  description: "",
  created_at: new Date(),
  updated_at: new Date(),
  testRuns: [],
};

interface TestsuiteStoreState {
  testSuite: TestSuite;
  currentTestRun: TestContainer;
  setTestSuite: (testSuite: TestSuite) => void;
  setTimestamps: (created_at: Date, updated_at: Date) => void;
  setCurrentTestRun: (currentTestRun: TestContainer) => void;
  resetTestSuite: () => void;
  resetCurrentTestRun: () => void;
  resetStore: () => void;
}

export const useTestsuiteStore = create<TestsuiteStoreState>((set) => ({
  testSuite: initialTestSuite,
  currentTestRun: initialTestRun,
  setTimestamps: (created_at, updated_at) =>
    set((state) => ({
      testSuite: {
        ...state.testSuite,
        created_at,
        updated_at,
      },
    })),
  setTestSuite: (testSuite) => set(() => ({ testSuite })),
  setCurrentTestRun: (currentTestRun: TestContainer) =>
    set((state) => ({
      currentTestRun: {
        ...state.currentTestRun,
        ...currentTestRun,
      },
    })),

  resetTestSuite: () =>
    set((state) => ({
      testSuite: initialTestSuite,
      currentTestRun: state.currentTestRun,
    })),
  resetCurrentTestRun: () =>
    set((state) => ({
      testSuite: state.testSuite,
      currentTestRun: initialTestRun,
    })),
  resetStore: () =>
    set(() => ({
      testSuite: initialTestSuite,
      currentTestRun: initialTestRun,
    })),
}));

export const updateCurrentTestRun = async (jobName: string) => {
  const podDetails: Pod = await getPodDetails(jobName);
  useTestsuiteStore.getState().setCurrentTestRun({
    jobName: jobName,
    podId: podDetails.id,
    podStatus: podDetails.status,
    taskStatus: podDetails.task_status,
    dockerContainerId: podDetails.docker_container_id,
    dockerImage: podDetails.docker_image,
    errorMessage: "",
    createdTime: new Date(podDetails.created_at),
    startTime: new Date(podDetails.started_at),
    endTime: null,
    environment: podDetails.environment,
  });
};

export const updateTestSuite = async () => {
  const testSuiteId = useTestsuiteStore.getState().testSuite.testSuiteId;
  await updateTestSuiteById(testSuiteId);
};

export const updateTestSuiteById = async (testSuiteId: string) => {
  const ts = await getTestSuite(testSuiteId);
  const currentTestRun = useTestsuiteStore.getState().currentTestRun;
  if (currentTestRun.jobName != "") {
    const tr = ts?.testRuns.find((testRun) => {
      if (testRun.jobName == currentTestRun.jobName) {
        return testRun;
      }
      return null;
    });
    if (
      tr?.podStatus == PodStatus.STOPPED ||
      tr?.taskStatus != TaskStatus.PROGESS
    ) {
      useTestsuiteStore.getState().resetCurrentTestRun();
    }
  }

  if (ts != null) {
    useTestsuiteStore.getState().setTestSuite(ts);
  }
};
