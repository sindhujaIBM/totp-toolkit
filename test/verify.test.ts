import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyTOTP } from "../src/verify.ts";

// Reuses the RFC 6238 vector: secret "12345678901234567890", unixSeconds=59
// falls in time-step T=1 (floor(59/30)=1), 8-digit code "94287082".
const secret = Buffer.from("12345678901234567890", "ascii");
const codeAtStep1 = "94287082";

test("verifyTOTP accepts the correct code at the exact time", () => {
  const result = verifyTOTP(secret, codeAtStep1, { digits: 8, unixSeconds: 59 });
  assert.equal(result.valid, true);
  assert.equal(result.matchedStep, 1);
});

test("verifyTOTP accepts a code generated one step earlier (drift tolerance)", () => {
  // "current" time is now step T=2 (unixSeconds 60-89), token is from T=1
  const result = verifyTOTP(secret, codeAtStep1, { digits: 8, unixSeconds: 89 });
  assert.equal(result.valid, true);
  assert.equal(result.matchedStep, 1);
});

test("verifyTOTP rejects a code two steps outside the drift window", () => {
  // "current" time is now step T=4 (unixSeconds 120-149), token is from T=1 — too old
  const result = verifyTOTP(secret, codeAtStep1, { digits: 8, unixSeconds: 125 });
  assert.equal(result.valid, false);
});

test("verifyTOTP rejects a wrong code entirely", () => {
  const result = verifyTOTP(secret, "00000000", { digits: 8, unixSeconds: 59 });
  assert.equal(result.valid, false);
});

test("verifyTOTP rejects a malformed/wrong-length token without throwing", () => {
  const result = verifyTOTP(secret, "123", { digits: 8, unixSeconds: 59 });
  assert.equal(result.valid, false);
});

test("verifyTOTP replay protection: rejects a step already marked used", () => {
  const result = verifyTOTP(secret, codeAtStep1, {
    digits: 8,
    unixSeconds: 59,
    lastUsedStep: 1,
  });
  assert.equal(result.valid, false);
});

test("verifyTOTP replay protection: accepts when lastUsedStep is older", () => {
  const result = verifyTOTP(secret, codeAtStep1, {
    digits: 8,
    unixSeconds: 59,
    lastUsedStep: 0,
  });
  assert.equal(result.valid, true);
  assert.equal(result.matchedStep, 1);
});
