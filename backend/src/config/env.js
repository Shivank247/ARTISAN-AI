import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// Fallback for environments where .env is already available
dotenv.config();

const requiredEnvironmentVariables = [
  "DATABASE_URL",
  "JWT_SECRET",
];

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `${variable} must be configured in backend/.env`
    );
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 5000),

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,

  aiProvider: process.env.AI_PROVIDER || "",

  aiApiKey: process.env.AI_API_KEY || "",

  aiServiceUrl: process.env.AI_SERVICE_URL || "",

  geminiModel: process.env.GEMINI_MODEL || "",
};

export default env;