import { ConfigItem } from "@/app/neutrino-test/[testSuiteId]/views/ConfigsTab";
import {
  PodStatus,
  PodDeploymentEnv,
  TaskStatus,
  Json,
} from "@neutrino-package/supabase/types";

export interface TestContainer {
  jobName: string;
  podId: number | null;
  podStatus: PodStatus;
  taskStatus: TaskStatus;
  dockerImage: string | undefined;
  dockerContainerId: string | undefined;
  testsuiteConfigs: string[] | undefined;
  errorMessage: string | undefined;
  createdTime: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  environment: PodDeploymentEnv;
}

export interface TestSuite {
  testSuiteId: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  testRuns: TestContainer[];
  testSuiteConfigs: ConfigItem[];
}
