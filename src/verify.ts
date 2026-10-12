import { timingSafeEqual as cryptoTimingSafeEqual } from "node:crypto";
import { generateHOTP, type HashAlgorithm } from "./hotp.ts";

export interface VerifyOptions {
  digits?: number;
  step?: number;
  window?: number;
  unixSeconds?: number;
  algorithm?: HashAlgorithm;
  lastUsedStep?: number;
}

export interface VerifyResult {
  valid: boolean;
  matchedStep?: number;
}

function constantTimeEqual(a: string, b: string, expectedLength: number): boolean {
  if (a.length !== expectedLength || b.length !== expectedLength) {
    return false;
  }
  return cryptoTimingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyTOTP(secret: Buffer, token: string, options: VerifyOptions = {}): VerifyResult {
  const {
    digits = 6,
    step = 30,
    window = 1,
    unixSeconds = Math.floor(Date.now() / 1000),
    algorithm = "sha1",
    lastUsedStep,
  } = options;

  const currentStep = Math.floor(unixSeconds / step);

  // No early return anywhere in this loop. Every candidate step gets a fresh
  // HMAC and a constant-time compare, unconditionally, every time, so total
  // work done is identical no matter which (if any) candidate matches —
  // nothing left for response timing to reveal.
  let matchedStep: number | undefined;

  for (let delta = -window; delta <= window; delta++) {
    const candidateStep = currentStep + delta;
    const alreadyUsed = lastUsedStep !== undefined && candidateStep <= lastUsedStep;
    const candidateCode = generateHOTP(secret, candidateStep, digits, algorithm);
    const codeMatches = constantTimeEqual(candidateCode, token, digits);

    if (codeMatches && !alreadyUsed && matchedStep === undefined) {
      matchedStep = candidateStep;
    }
  }

  return matchedStep !== undefined ? { valid: true, matchedStep } : { valid: false };
}
