import fastify, { FastifyServerOptions } from "fastify";
import fastifySensible from "@fastify/sensible";
import fastifyCors from "@fastify/cors";
import requestLogger from "./utils/request-logger.js";

export default function buildFastifyServer(options?: FastifyServerOptions) {
  const server = fastify(options);

  // Plugins
  server.register(requestLogger);
  server.register(fastifySensible);
  server.register(fastifyCors, { origin: true });

  return server;
}
