import { test } from "node:test";
import assert from "node:assert/strict";
import { base32Encode, base32Decode } from "../src/base32.ts";

// Official RFC 4648 Section 10 test vectors
const vectors: [string, string][] = [
  ["", ""],
  ["f", "MY======"],
  ["fo", "MZXQ===="],
  ["foo", "MZXW6==="],
  ["foob", "MZXW6YQ="],
  ["fooba", "MZXW6YTB"],
  ["foobar", "MZXW6YTBOI======"],
];

test("base32Encode matches RFC 4648 test vectors", () => {
  for (const [input, expected] of vectors) {
    const actual = base32Encode(Buffer.from(input, "ascii"));
    assert.equal(actual, expected, `encoding "${input}"`);
  }
});

test("base32Decode matches RFC 4648 test vectors", () => {
  for (const [expected, input] of vectors) {
    const actual = base32Decode(input).toString("ascii");
    assert.equal(actual, expected, `decoding "${input}"`);
  }
});

test("base32Decode is the inverse of base32Encode for arbitrary bytes", () => {
  const original = Buffer.from([0, 1, 2, 253, 254, 255, 42, 17]);
  const roundTripped = base32Decode(base32Encode(original));
  assert.deepEqual(roundTripped, original);
});
