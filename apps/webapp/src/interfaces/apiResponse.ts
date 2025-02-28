export interface ApiRunTestInterface {
  jobName: string;
  podId: number;
  status: number;
  error?: string;
}
