import { test } from "node:test";
import assert from "node:assert/strict";
import { generateURI } from "../src/uri.ts";

test("generateURI strips base32 padding from the secret", () => {
  // "MZXW6===" is the real RFC 4648 base32 encoding of "foo" — has padding.
  const uri = generateURI("MZXW6===", {
    issuer: "ACME",
    accountName: "alice@example.com",
  });

  const parsed = new URL(uri);
  assert.equal(parsed.searchParams.get("secret"), "MZXW6");
});

test("generateURI uses the correct scheme and URL-encodes issuer/account in the label", () => {
  const uri = generateURI("JBSWY3DPEHPK3PXP", {
    issuer: "Big Corporation",
    accountName: "alice@bigco.com",
  });

  assert.ok(uri.startsWith("otpauth://totp/"));
  assert.ok(uri.includes("Big%20Corporation"));
  assert.ok(uri.includes("alice%40bigco.com"));
});

test("generateURI applies correct defaults", () => {
  const uri = generateURI("JBSWY3DPEHPK3PXP", {
    issuer: "ACME",
    accountName: "alice@example.com",
  });

  const parsed = new URL(uri);
  assert.equal(parsed.searchParams.get("algorithm"), "SHA1");
  assert.equal(parsed.searchParams.get("digits"), "6");
  assert.equal(parsed.searchParams.get("period"), "30");
  assert.equal(parsed.searchParams.get("issuer"), "ACME");
});

test("generateURI honors custom digits, period, and algorithm", () => {
  const uri = generateURI("JBSWY3DPEHPK3PXP", {
    issuer: "ACME",
    accountName: "alice@example.com",
    digits: 8,
    period: 60,
    algorithm: "sha256",
  });

  const parsed = new URL(uri);
  assert.equal(parsed.searchParams.get("algorithm"), "SHA256");
  assert.equal(parsed.searchParams.get("digits"), "8");
  assert.equal(parsed.searchParams.get("period"), "60");
});
