import jwt from "jsonwebtoken";

import env from "../config/env.js";
import prisma from "../utils/prisma.js";

function authError(message = "Authentication required.") {
  const error = new Error(message);
  error.statusCode = 401;
  error.code = "UNAUTHORIZED";
  return error;
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token || !env.jwtSecret) throw authError();

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) throw authError();
    req.user = user;
    return next();
  } catch (error) {
    if (error.code === "UNAUTHORIZED" || error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(authError());
    }
    return next(error);
  }
}

export function optionalAuth(req, res, next) {
  if (!req.headers.authorization) return next();
  return requireAuth(req, res, next);
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error("You do not have permission for this action.");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      return next(error);
    }
    return next();
  };
}