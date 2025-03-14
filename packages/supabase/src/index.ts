// package/supabase/index.ts

import { SupabaseClient } from "@supabase/supabase-js";
import {
  Testsuite,
  Task,
  Pod,
  Log,
  BrowserAction,
  BrowserActionType,
} from "./types";

export class SupabaseDB {
  private client: SupabaseClient;
  private imageBucket = "browser-actions-bucket";
  private TABLENAME_TESTSUITES = "testsuites";
  private TABLENAME_TASKS = "tasks";
  private TABLENAME_PODS = "pods";
  private TABLENAME_LOGS = "logs";
  private TABLENAME_BROWSER_ACTIONS = "browser_actions";

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // -------------------------
  // Testsuite operations
  // -------------------------

  async createTestsuite(testsuite: Partial<Testsuite>): Promise<Testsuite> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TESTSUITES)
      .insert(testsuite)
      .select()
      .single();
    if (error) {
      console.error("Error creating testsuite:", error);
      throw error;
    }
    return data;
  }

  async getTestsuitesByUser(user_id: string): Promise<Testsuite[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TESTSUITES)
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      console.error("Error fetching testsuites:", error);
      throw error;
    }
    return data || [];
  }

  async getTestsuite(id: string): Promise<Testsuite> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TESTSUITES)
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching testsuite:", error);
      throw error;
    }
    return data;
  }

  async getAllTestsuite(): Promise<Testsuite[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TESTSUITES)
      .select("*");
    if (error) {
      console.error("Error fetching testsuite:", error);
      throw error;
    }
    return data;
  }

  // -------------------------
  // Task operations
  // -------------------------

  async createTask(task: Partial<Task>): Promise<Task> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TASKS)
      .insert(task)
      .select()
      .single();
    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }
    return data;
  }

  async deleteTask(taskId: number): Promise<void> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TASKS)
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  async getTasksByTestsuite(testsuite_id: string): Promise<Task[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_TASKS)
      .select("*")
      .eq("testsuite_id", testsuite_id);
    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
    return data || [];
  }

  // -------------------------
  // Pod operations
  // -------------------------

  async createPod(pod: Partial<Pod>): Promise<Pod> {
    const { data, error } = await this.client
      .from(this.TABLENAME_PODS)
      .insert(pod)
      .select()
      .single();
    if (error) {
      console.error("Error creating pod:", error);
      throw error;
    }
    return data;
  }

  async updatePod(id: number, updates: Partial<Pod>): Promise<Pod> {
    const { data, error } = await this.client
      .from(this.TABLENAME_PODS)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error updating pod:", error);
      throw error;
    }
    return data;
  }

  async updatePodByJobName(
    jobName: string,
    updates: Partial<Pod>
  ): Promise<Pod> {
    const { data, error } = await this.client
      .from(this.TABLENAME_PODS)
      .update(updates)
      .eq("jobname", jobName)
      .select()
      .single();
    if (error) {
      console.error("Error updating pod:", error);
      throw error;
    }
    return data;
  }

  async getPodsByTestsuite(testsuite_id: string): Promise<Pod[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_PODS)
      .select("*")
      .eq("testsuite_id", testsuite_id);
    if (error) {
      console.error("Error fetching pods:", error);
      throw error;
    }
    return data || [];
  }

  async getPodByJobName(jobname: string): Promise<Pod> {
    const { data, error } = await this.client
      .from(this.TABLENAME_PODS)
      .select("*")
      .eq("jobname", jobname)
      .single();
    if (error) {
      console.error("Error fetching pods:", error);
      throw error;
    }
    return data || {};
  }

  // -------------------------
  // Log operations
  // -------------------------

  async createLog(log: Partial<Log>): Promise<Log> {
    const { data, error } = await this.client.from("logs").insert(log).single();
    if (error) {
      console.error("Error creating log:", error);
      throw error;
    }
    return data;
  }

  async getLogsByPod(pod_id: number): Promise<Log[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_LOGS)
      .select("*")
      .eq("pod_id", pod_id);
    if (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
    return data || [];
  }

  // -------------------------
  // Image Bucket operations
  // -------------------------

  async uploadBrowserActionToBucket(
    filePath: string,
    file: File | Blob
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.imageBucket)
      .upload(filePath, file);
    if (error) {
      console.error("Error uploading image to bucket:", error);
      throw error;
    }
    return data.path;
  }

  async deleteBrowserActionFromBucket(filePath: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.imageBucket)
      .remove([filePath]);
    if (error) {
      console.error("Error deleting image from bucket:", error);
      throw error;
    }
  }

  async getBrowserActionFromBucket(
    filePath: string,
    expiresIn = 3600
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.imageBucket)
      .createSignedUrl(filePath, expiresIn);
    if (error) {
      console.error("Error getting signed URL for image:", error);
      throw error;
    }
    return data.signedUrl;
  }

  // -------------------------
  // Image operations (BrowserActions)
  // -------------------------

  async createBrowserAction(
    image: Partial<BrowserAction>,
    file: File | Blob
  ): Promise<BrowserAction> {
    if (!image.jobname || !image.file_name) {
      throw new Error(
        "jobname and file_name are required in the image metadata"
      );
    }
    const filePath = `${image.jobname}/${Date.now()}_${image.file_name}`;
    const uploadedPath = await this.uploadBrowserActionToBucket(filePath, file);
    image.file_path = uploadedPath;
    const { data, error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .insert(image)
      .select()
      .single();
    if (error) {
      console.error("Error creating browser action:", error);
      throw error;
    }
    return data;
  }

  async getBrowserAction(id: number): Promise<BrowserAction> {
    const { data, error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching browser action:", error);
      throw error;
    }
    return data;
  }

  async getRecentBrowserAction(
    image_type: BrowserActionType = BrowserActionType.TASK
  ): Promise<BrowserAction | null> {
    const { data, error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .select("*")
      .eq("image_type", image_type)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Error fetching recent browser action:", error);
      throw error;
    }
    return data;
  }

  async getBrowserActionsByPod(pod_id: number): Promise<BrowserAction[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .select("*")
      .eq("pod_id", pod_id);
    if (error) {
      console.error("Error fetching browser actions by pod:", error);
      throw error;
    }
    return data || [];
  }

  async getBrowserActionsByJobName(jobname: string): Promise<BrowserAction[]> {
    const { data, error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .select("*")
      .eq("jobname", jobname);
    if (error) {
      console.error("Error fetching browser action by jobname:", error);
      throw error;
    }
    return data || [];
  }

  async updateBrowserAction(
    id: number,
    updates: Partial<BrowserAction> & { newFile?: File | Blob }
  ): Promise<BrowserAction> {
    const existing = await this.getBrowserAction(id);
    if (updates.newFile) {
      const filePath = `${existing.jobname}/${Date.now()}_${
        existing.file_name
      }`;
      const uploadedPath = await this.uploadBrowserActionToBucket(
        filePath,
        updates.newFile
      );
      updates.file_path = uploadedPath;
      await this.deleteBrowserActionFromBucket(existing.file_path);
    }
    delete updates.newFile;
    const { data, error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error updating browser action:", error);
      throw error;
    }
    return data;
  }

  async deleteBrowserAction(id: number): Promise<void> {
    const image = await this.getBrowserAction(id);
    await this.deleteBrowserActionFromBucket(image.file_path);
    const { error } = await this.client
      .from(this.TABLENAME_BROWSER_ACTIONS)
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting browser action record:", error);
      throw error;
    }
  }
}
