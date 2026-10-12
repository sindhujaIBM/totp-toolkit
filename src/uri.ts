import type { HashAlgorithm } from "./hotp.ts";

export interface TOTPUriOptions {
  issuer: string;
  accountName: string;
  digits?: number;
  period?: number;
  algorithm?: HashAlgorithm;
}

function encodeParam(key: string, value: string): string {
  return `${key}=${encodeURIComponent(value)}`;
}

export function generateURI(base32Secret: string, options: TOTPUriOptions): string {
  const { issuer, accountName, digits = 6, period = 30, algorithm = "sha1" } = options;

  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`;
  const secret = base32Secret.replace(/=+$/, "");

  const query = [
    encodeParam("secret", secret),
    encodeParam("issuer", issuer),
    encodeParam("algorithm", algorithm.toUpperCase()),
    encodeParam("digits", String(digits)),
    encodeParam("period", String(period)),
  ].join("&");

  return `otpauth://totp/${label}?${query}`;
}
