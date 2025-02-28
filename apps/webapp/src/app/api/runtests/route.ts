import { NextResponse } from "next/server";
import { createNeutrinoJob, JobDetails } from "../../../services/k8sJobs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const testId = body?.testId || Date.now().toString();
    const jobId = body?.jobId || Date.now().toString();

    const response: JobDetails = await createNeutrinoJob(jobId, testId);

    return NextResponse.json({ ...response }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
