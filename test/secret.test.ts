import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSecret } from "../src/secret.ts";
import { base32Decode } from "../src/base32.ts";

test("generateSecret defaults to 20 bytes (160 bits)", () => {
  const { secret } = generateSecret();
  assert.equal(secret.length, 20);
});

test("generateSecret's base32 field decodes back to the same raw bytes", () => {
  const { secret, base32 } = generateSecret();
  assert.deepEqual(base32Decode(base32), secret);
});

test("generateSecret produces different secrets each call", () => {
  const a = generateSecret();
  const b = generateSecret();
  assert.notEqual(a.base32, b.base32);
});

test("generateSecret rejects lengths below the 128-bit minimum", () => {
  assert.throws(() => generateSecret(8), /at least 16 bytes/);
});

test("generateSecret accepts a custom valid length", () => {
  const { secret } = generateSecret(32);
  assert.equal(secret.length, 32);
});
