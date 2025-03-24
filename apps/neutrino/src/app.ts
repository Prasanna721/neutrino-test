import buildFastifyServer from "./server/build.js";
import { loggingConfig } from "./config.js";
import { API } from "./api/version/v2.js";
// import { API } from "./api/index.js";

const app = async () => {
  const dockerJobName = process.env.JOB_NAME;
  const testSuiteId = process.env.TESTSUITE_ID;

  if (dockerJobName && testSuiteId) {
    const api = new API(dockerJobName, testSuiteId, false);
    api.startTest();

    return api;
  } else {
    console.error("TestSuiteId is not available");
  }
  return null;
};

const api = app();

// Start Server
// export const server = buildFastifyServer({
//     logger: loggingConfig[process.env.NODE_ENV ?? "production"] ?? true,
//     disableRequestLogging: false,
//     trustProxy: true,
//     bodyLimit: 100000000,
// });

// const HOST = process.env.HOST ?? "0.0.0.0";
// const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// server.listen({ port: PORT, host: HOST }, (err, address) => {
//     if (err) {
//         console.error(err);
//         process.exit(1);
//     }
// });
