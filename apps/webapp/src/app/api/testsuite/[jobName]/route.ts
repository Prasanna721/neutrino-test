import { NextRequest, NextResponse } from "next/server";
import {
  getPodNameForJob,
  getPodInfo,
  getPodLogs,
  deletePod,
} from "@/services/k8sJobs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobName: string }> }
) {
  const { jobName } = await params;

  const podName = await getPodNameForJob(jobName);
  if (!podName) {
    return NextResponse.json(
      { message: "Invalid Testsuit JobName" },
      { status: 404 }
    );
  }

  const podInfo = await getPodInfo(podName);
  const logs = await getPodLogs(podName);
  if (!logs && !podInfo) {
    return NextResponse.json({ message: "pods not found" }, { status: 404 });
  }

  return NextResponse.json({ podInfo, logs }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobName: string }> }
) {
  const { jobName } = await params;
  const podName = await getPodNameForJob(jobName);
  if (!podName) {
    return NextResponse.json(
      { message: "Invalid Testsuit JobName" },
      { status: 404 }
    );
  }
  const removed = await deletePod(podName, jobName);
  if (!removed) {
    return NextResponse.json(
      { message: "Testsuit termination failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ message: "Testsuit terminated" }, { status: 200 });
}
