import app from "./app.js";
import env from "./config/env.js";
import prisma from "./utils/prisma.js";

let server;

async function startServer() {
  try {
    await prisma.$connect();

    server = app.listen(env.port, () => {
      console.log("");
      console.log("========================================");
      console.log("       ARTISAN AI BACKEND");
      console.log("========================================");
      console.log(`Environment : ${env.nodeEnv}`);
      console.log(`Server      : ${env.backendUrl}`);
      console.log(`API         : ${env.backendUrl}/api`);
      console.log(`Health      : ${env.backendUrl}/api/health`);
      console.log("Database    : Connected");
      console.log("========================================");
      console.log("");
    });
  } catch (error) {
    console.error("Failed to start backend.");

    if (env.nodeEnv !== "production") {
      console.error(error);
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log("Backend stopped.");
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();