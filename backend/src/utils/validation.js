import { httpError } from "./httpError.js";

export function requiredString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} is required.`);
  }
  return value.trim();
}

export function optionalString(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} must be a string.`);
  }
  return value.trim();
}

export function positiveInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} must be a positive integer.`);
  }
  return number;
}

export function optionalNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} must be a number.`);
  }
  return number;
}