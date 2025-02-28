export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export enum PodDeploymentEnv {
  INTERACTIVE = "Interactive",
  PREVIEW = "Preview",
  PRODUCTION = "Production",
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface Testsuite {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  testsuite_id: string;
  description: string;
  order_index: number;
  created_at: string;
}

export enum PodStatus {
  STARTING = "starting",
  RUNNING = "running",
  TERMINATING = "terminating",
  STOPPED = "stopped",
  ERROR = "error",
}

export enum TaskStatus {
  SUCCESS = "success",
  CANCELLED = "cancelled",
  FAILED = "failed",
  PROGESS = "progress",
}

export interface Pod {
  id: number;
  testsuite_id: string;
  status: PodStatus;
  task_status: TaskStatus;
  docker_container_id?: string;
  docker_image?: string;
  host?: string;
  error_message?: string;
  jobname: string;
  environment: PodDeploymentEnv;
  created_at: string;
  started_at: string;
  finished_at?: string;
}

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface Log {
  id: number;
  pod_id: number;
  timestamp: string;
  level: LogLevel;
  message: Json;
  meta?: Record<string, unknown>;
}

export enum TaskImageType {
  TASK = "TASK",
  VERIFICATION = "VERIFICATION",
  VIDEO = "VIDEO",
  ERROR = "ERROR",
}

export interface TaskImage {
  id: number;
  jobname: string;
  pod_id: number;
  file_path: string;
  file_name: string;
  page_url: string;
  mime_type: string;
  image_type: TaskImageType;
  details?: Json;
  created_at: string;
}
