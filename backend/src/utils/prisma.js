import env from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;