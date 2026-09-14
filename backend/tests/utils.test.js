import test from "node:test";
import assert from "node:assert/strict";

import {
  optionalNumber,
  optionalString,
  positiveInteger,
  requiredString,
} from "../src/utils/validation.js";
import { successResponse } from "../src/utils/response.js";

test("requiredString trims valid input and rejects blank values", () => {
  assert.equal(requiredString("  artisan  ", "name"), "artisan");

  assert.throws(
    () => requiredString("   ", "name"),
    (error) => error.statusCode === 400 && error.code === "VALIDATION_ERROR",
  );
});

test("optionalString normalizes empty values and rejects non-strings", () => {
  assert.equal(optionalString("  Bihar  ", "state"), "Bihar");
  assert.equal(optionalString("", "state"), null);
  assert.equal(optionalString(null, "state"), null);

  assert.throws(
    () => optionalString(42, "state"),
    (error) => error.statusCode === 400 && error.code === "VALIDATION_ERROR",
  );
});

test("numeric validators enforce the API's numeric constraints", () => {
  assert.equal(positiveInteger("5", "price"), 5);
  assert.equal(optionalNumber("26.35", "latitude"), 26.35);
  assert.equal(optionalNumber(undefined, "longitude"), null);

  assert.throws(() => positiveInteger(0, "quantity"));
  assert.throws(() => optionalNumber("unknown", "latitude"));
});

test("successResponse uses the shared response envelope", () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  assert.equal(successResponse(response, { id: "product-1" }, 201), response);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, {
    success: true,
    data: { id: "product-1" },
  });
});