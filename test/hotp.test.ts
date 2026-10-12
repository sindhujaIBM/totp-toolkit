import { test } from "node:test";
import assert from "node:assert/strict";
import { generateHOTP } from "../src/hotp.ts";

// Official RFC 4226 Appendix D test vectors
// Secret: ASCII "12345678901234567890"
const secret = Buffer.from("12345678901234567890", "ascii");

const vectors: [number, string][] = [
  [0, "755224"],
  [1, "287082"],
  [2, "359152"],
  [3, "969429"],
  [4, "338314"],
  [5, "254676"],
  [6, "287922"],
  [7, "162583"],
  [8, "399871"],
  [9, "520489"],
];

test("generateHOTP matches RFC 4226 Appendix D test vectors", () => {
  for (const [counter, expected] of vectors) {
    const actual = generateHOTP(secret, counter);
    assert.equal(actual, expected, `counter ${counter}`);
  }
});
