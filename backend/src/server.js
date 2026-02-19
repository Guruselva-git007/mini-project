import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import { initializeSocket } from "./socket/socket.js";

const server = http.createServer(app);

initializeSocket(server);

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on port ${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
