import { createHmac } from "node:crypto";

export type HashAlgorithm = "sha1" | "sha256" | "sha512";

export function generateHOTP(
  secret: Buffer,
  counter: number,
  digits = 6,
  algorithm: HashAlgorithm = "sha1",
): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac(algorithm, secret).update(counterBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;

  const truncated =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = truncated % 10 ** digits;

  return code.toString().padStart(digits, "0");
}
