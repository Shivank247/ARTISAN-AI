import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import prisma from "../utils/prisma.js";
import { httpError } from "../utils/httpError.js";
import { requiredString, optionalString } from "../utils/validation.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    language: user.language,
  };
}

function issueToken(user) {
  if (!env.jwtSecret) throw httpError(500, "AUTH_CONFIGURATION_ERROR", "JWT authentication is not configured.");
  return jwt.sign({ role: user.role }, env.jwtSecret, { subject: user.id, expiresIn: "7d" });
}

export async function registerUser(input) {
  const name = requiredString(input.name, "name");
  const phone = requiredString(input.phone, "phone");
  const password = requiredString(input.password, "password");
  const role = input.role || "CUSTOMER";
  const language = optionalString(input.language, "language") || "en";

  if (!["ARTISAN", "CUSTOMER", "ADMIN"].includes(role)) {
    throw httpError(400, "VALIDATION_ERROR", "Invalid role.");
  }
  if (role === "ADMIN") {
    throw httpError(403, "FORBIDDEN", "Administrator accounts cannot be created through public registration.");
  }
  if (password.length < 6) throw httpError(400, "VALIDATION_ERROR", "Password must be at least 6 characters.");

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) throw httpError(409, "PHONE_ALREADY_REGISTERED", "A user with this phone already exists.");

  const user = await prisma.user.create({
    data: { name, phone, passwordHash: await bcrypt.hash(password, 10), role, language },
  });

  if (role === "ARTISAN") await prisma.artisan.create({ data: { userId: user.id } });
  return { user: publicUser(user), token: issueToken(user) };
}

export async function loginUser(input) {
  const phone = requiredString(input.phone, "phone");
  const password = requiredString(input.password, "password");
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, "INVALID_CREDENTIALS", "Phone or password is incorrect.");
  }
  return { user: publicUser(user), token: issueToken(user) };
}

export { publicUser };
