import { generateHOTP, type HashAlgorithm } from "./hotp.ts";

export interface TOTPOptions {
  digits?: number;
  step?: number;
  unixSeconds?: number;
  algorithm?: HashAlgorithm;
}

export function generateTOTP(secret: Buffer, options: TOTPOptions = {}): string {
  const {
    digits = 6,
    step = 30,
    unixSeconds = Math.floor(Date.now() / 1000),
    algorithm = "sha1",
  } = options;

  const counter = Math.floor(unixSeconds / step);

  return generateHOTP(secret, counter, digits, algorithm);
}
