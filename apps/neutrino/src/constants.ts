export const screenshotDIR = "screenshots";
export const screenshotPath = (jobName: string, j: number) =>
  `${screenshotDIR}/testSuite_${jobName}_${j}.png`;

export const VAR_JSON = "json";
export const VAR_SUCCESS = "success";
export const VAR_FAILURE = "failure";
export const VAR_partial = "partial";
