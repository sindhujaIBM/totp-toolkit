import { randomBytes } from "node:crypto";
import { base32Encode } from "./base32.ts";

export interface GeneratedSecret {
  secret: Buffer;
  base32: string;
}

export function generateSecret(byteLength = 20): GeneratedSecret {
  if (byteLength < 16) {
    throw new Error(
      `Secret must be at least 16 bytes (128 bits) per RFC 4226; got ${byteLength}.`,
    );
  }

  const secret = randomBytes(byteLength);

  return {
    secret,
    base32: base32Encode(secret),
  };
}
