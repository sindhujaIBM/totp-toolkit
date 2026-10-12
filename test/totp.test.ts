import { test } from "node:test";
import assert from "node:assert/strict";
import { generateTOTP } from "../src/totp.ts";

// Official RFC 6238 Appendix B test vectors (SHA1 rows only — the SHA1 secret
// is unambiguous ASCII; SHA256/SHA512 secrets are not verified here yet).
// Secret: ASCII "12345678901234567890", 8-digit codes, 30s step.
const secret = Buffer.from("12345678901234567890", "ascii");

const vectors: [number, string][] = [
  [59, "94287082"],
  [1111111109, "07081804"],
  [1111111111, "14050471"],
  [1234567890, "89005924"],
  [2000000000, "69279037"],
  [20000000000, "65353130"],
];

test("generateTOTP matches RFC 6238 Appendix B test vectors (SHA1)", () => {
  for (const [unixSeconds, expected] of vectors) {
    const actual = generateTOTP(secret, { digits: 8, unixSeconds });
    assert.equal(actual, expected, `unixSeconds ${unixSeconds}`);
  }
});

test("generateTOTP defaults to 6 digits", () => {
  const code = generateTOTP(secret, { unixSeconds: 59 });
  assert.equal(code.length, 6);
});
