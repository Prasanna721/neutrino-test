import { V1Pod } from "@kubernetes/client-node";

export interface ExtractedPodInfo {
    metadata: {
      name?: string;
      namespace?: string;
      labels?: {
        "job-name"?: string;
      };
    };
    spec: {
      containers?: {
        name: string;
        image?: string;
        command?: string[];
        // env?: { name: string; value: string }[];
      }[];
      nodeName?: string;
      restartPolicy?: string;
    };
    status: {
      phase?: string;
      podIP?: string;
      hostIP?: string;
      startTime?: Date;
      containerStatuses?: {
        name: string;
        image: string;
        ready: boolean;
        state: any;
      }[];
    };
  }

export const extractPodInfo = (podInfo: V1Pod): ExtractedPodInfo => {
    return {
      metadata: {
        name: podInfo.metadata?.name,
        namespace: podInfo.metadata?.namespace,
        labels: {
          "job-name": podInfo.metadata?.labels?.["job-name"]
        }
      },
      spec: {
        containers: podInfo.spec?.containers?.map(container => ({
          name: container.name,
          image: container.image,
          command: container.command,
        //   env: container.env?.filter(envVar => envVar.name === "TESTSUITE_ID")
        })),
        nodeName: podInfo.spec?.nodeName,
        restartPolicy: podInfo.spec?.restartPolicy
      },
      status: {
        phase: podInfo.status?.phase,
        podIP: podInfo.status?.podIP,
        hostIP: podInfo.status?.hostIP,
        startTime: podInfo.status?.startTime,
        containerStatuses: podInfo.status?.containerStatuses?.map(status => ({
          name: status.name,
          image: status.image,
          ready: status.ready,
          state: status.state
        }))
      }
    };
}

  