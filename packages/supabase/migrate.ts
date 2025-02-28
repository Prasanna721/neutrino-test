import { SupabaseDB } from "./src";
import { createSupabaseClient } from "./src/config";
import { Pod, PodStatus } from "./src/types";
import { promises as fs } from "fs";
import { TaskImage, TaskImageType } from "@neutrino-package/supabase/types";

async function runSampleInserts(db: SupabaseDB) {
  try {
    const testsuite = await db.createTestsuite({
      user_id: undefined,
      name: "Affogato Test Suite",
      description: "A test suite for checking the flow of affogato.nyc",
    });
    console.log("Inserted sample testsuite:", testsuite);

    const testSuiteTasks = [
      "go to https://affogato.nyc",
      "search for 'artisanal pastries'",
      "click on the search button",
      "for four people",
      "click on next button",
      "select east village on the map",
      "click on next button",
      "click on the first result",
    ];

    for (let i = 0; i < testSuiteTasks.length; i++) {
      const taskDescription = testSuiteTasks[i];
      const task = await db.createTask({
        testsuite_id: testsuite.id,
        description: taskDescription,
      });
      console.log(`Inserted sample task ${i + 1}:`, task);
    }
  } catch (error) {
    console.error("Error during sample inserts:", error);
  }
}

async function getTestsuiteData(db: SupabaseDB, testsuiteId: string) {
  try {
    const tasks = await db.getTasksByTestsuite(testsuiteId);

    const transformedTasks = tasks
      .sort((a, b) => a.order_index - b.order_index)
      .map((task) => ({
        id: task.order_index,
        text: task.description,
      }));
    console.log(transformedTasks);

    return {
      testsuiteId,
      tasks,
    };
  } catch (error) {
    console.error("Error fetching testsuite data:", error);
    throw error;
  }
}

async function getTestsuite(db: SupabaseDB, testsuiteId: string) {
  try {
    const ts = await db.getTestsuite(testsuiteId);
    const testSuite = {
      testSuite_id: ts.id,
      name: ts.name,
      description: ts.description || "",
      created_at: new Date(ts.created_at),
      updated_at: new Date(ts.updated_at),
    };
    console.log(testSuite);
  } catch (error) {
    console.error("Error fetching testsuite data:", error);
    throw error;
  }
}

async function createPod(db: SupabaseDB, testSuiteId: string, jobname: string) {
  const pod: Partial<Pod> = {
    testsuite_id: testSuiteId,
    status: PodStatus.STARTING,
    jobname: jobname,
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
  };

  const podDetails = await db.createPod(pod);
  console.log(podDetails);
  return podDetails.id;
}
async function updatePod(db: SupabaseDB, podId: number) {
  const pod: Partial<Pod> = {
    finished_at: new Date().toISOString(),
  };

  const podDetails = await db.updatePod(podId, pod);
  console.log(podDetails);
  return podDetails.id;
}

async function getPodByJobName(db: SupabaseDB, jobname: string) {
  const pods = await db.getPodByJobName(jobname);
  console.log(pods);
  return pods;
}

export async function addStaticTaskImage(db: SupabaseDB) {
  const filePath = "./temp/testSuite_neutrino-test-50eb7217fcbd_1.png";
  const fileBuffer = await fs.readFile(filePath);
  const fileBlob = new Blob([fileBuffer], { type: "image/png" });
  const imageMetadata: Partial<TaskImage> = {
    jobname: "neutrino-test-3b1335d8a522",
    file_name: filePath.split("/").pop() || "screenshot.png",
    pod_id: 8,
    image_type: TaskImageType.TASK,
    details: {},
  };
  await db.createTaskImage(imageMetadata, fileBlob);
}

async function getLink(
  db: SupabaseDB,
  filePath: string,
  expiresIn = 3600
): Promise<string> {
  try {
    const signedUrl = await db.getTaskImageFromBucket(filePath, expiresIn);
    console.log("Signed URL:", signedUrl);
    return signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}

async function getTaskImagesByJobName(
  db: SupabaseDB,
  jobname: string
): Promise<TaskImage[]> {
  try {
    const images = await db.getTaskImagesByJobName(jobname);
    console.log(`Task images for jobname "${jobname}":`, images);
    return images;
  } catch (error) {
    console.error(
      `Error fetching task images for jobname "${jobname}":`,
      error
    );
    throw error;
  }
}

async function main() {
  try {
    const supabaseClient = createSupabaseClient();
    const db = new SupabaseDB(supabaseClient);
    await runSampleInserts(db);
    // await getTestsuiteData(db, '6c5af90589f23139');
    // await createPod(db, '6c5af90589f23139', 'kndksndks');
    // await updatePod(db, 1 );
    // await getPodByJobName(db, 'neutrino-test-1f604609e9da');
    // await addStaticTaskImage(db);
    // await getTaskImagesByJobName(db, "neutrino-test-7d57b4a42728");
    // await getLink(
    //   db,
    //   "neutrino-test-7d57b4a42728/1740277175008_7460fae5919c0e465be4c38ecebad785.webm"
    // );
  } catch (error) {
    console.error("Error in migration script:", error);
  }
}

main();
