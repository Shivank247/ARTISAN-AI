import { errorResponse } from "../utils/response.js";

export function notFoundMiddleware(req, res) {
  return errorResponse(
    res,
    "NOT_FOUND",
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
}

export function errorMiddleware(err, req, res, next) {
  console.error("Backend error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : 500;

  const code =
    typeof err.code === "string" && err.code.length > 0
      ? err.code
      : "INTERNAL_SERVER_ERROR";

  const message =
    statusCode >= 500
      ? "An unexpected server error occurred."
      : err.message || "Request failed.";

  return errorResponse(
    res,
    code,
    message,
    statusCode
  );
}