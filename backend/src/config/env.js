import "dotenv/config";

const requiredEnvironmentVariables = [
  "DATABASE_URL",
];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    throw new Error(
      `Missing required environment variable: ${variableName}`
    );
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET || "",

  aiApiKey: process.env.AI_API_KEY || "",

  aiServiceUrl: process.env.AI_SERVICE_URL || "",

  sttApiKey: process.env.STT_API_KEY || "",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
};

export default env;