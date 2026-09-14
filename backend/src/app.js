import express from "express";
import cors from "cors";

import env from "./config/env.js";
import prisma from "./utils/prisma.js";
import { successResponse } from "./utils/response.js";
import authRoutes from "./routes/authRoutes.js";
import artisanRoutes from "./routes/artisanRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import {
  notFoundMiddleware,
  errorMiddleware,
} from "./middleware/errorMiddleware.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
  return successResponse(res, {
    name: "ARTISAN AI Backend",
    message: "Backend is running.",
    environment: env.nodeEnv,
  });
});

app.get("/api/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return successResponse(res, {
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    error.statusCode = 503;
    error.code = "DATABASE_UNAVAILABLE";

    return next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;