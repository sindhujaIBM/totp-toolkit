# @sindhujaks/totp

Zero-dependency TypeScript implementation of TOTP/HOTP two-factor authentication (RFC 6238 / RFC 4226), verified against the official RFC test vectors, not just "looks right."

## Install

```
npm install @sindhujaks/totp
```

## Important: this library does not store anything

This package is intentionally **storage-agnostic**. It will generate secrets and compute/verify codes, but it never writes to a database, a file, or anywhere else, and it never will.

That's not a missing feature, it's a deliberate boundary. A TOTP secret can't be stored the way a password is (as a one-way hash), the server needs the real secret value every time to recompute the code. That means secret storage requires **encryption at rest**, with the decryption key held separately (ideally in a KMS/HSM). Getting that right is your application's responsibility, not this library's. Store the secret this library gives you encrypted, never in plaintext.

## Usage

### Enroll a new user

```ts
import { generateSecret, generateURI } from "@sindhujaks/totp";

const { secret, base32 } = generateSecret();

const uri = generateURI(base32, {
  issuer: "YourApp",
  accountName: "alice@example.com",
});

// Turn `uri` into a QR code with any QR library you like (e.g. `qrcode`),
// then have the user scan it with their authenticator app.
// Store `secret` (encrypted) against the user's account — you'll need it
// every time you verify a code.
```

### Verify a code at login

```ts
import { verifyTOTP } from "@sindhujaks/totp";

const result = verifyTOTP(secret, userSubmittedCode, {
  lastUsedStep: user.lastUsedTotpStep, // optional, enables replay protection
});

if (result.valid) {
  // Persist result.matchedStep as the new lastUsedStep for this user,
  // so the same code can't be replayed.
}
```

### Lower-level pieces

```ts
import { generateHOTP, generateTOTP, base32Encode, base32Decode } from "@sindhujaks/totp";
```

## API

- `generateSecret(byteLength = 20)` — cryptographically random secret (`crypto.randomBytes`), refuses lengths under 128 bits. Returns `{ secret: Buffer, base32: string }`.
- `generateHOTP(secret, counter, digits = 6, algorithm = "sha1")` — RFC 4226 counter-based code.
- `generateTOTP(secret, options)` — RFC 6238 time-based code. Options: `digits`, `step` (seconds, default 30), `unixSeconds` (default: now), `algorithm`.
- `verifyTOTP(secret, token, options)` — constant-time verification with a configurable drift window (default ±1 step) and optional replay protection via `lastUsedStep`. Returns `{ valid: boolean, matchedStep?: number }`.
- `generateURI(base32Secret, options)` — builds an `otpauth://` URI for QR-code enrollment. Options: `issuer`, `accountName`, `digits`, `period`, `algorithm`.
- `base32Encode(buffer)` / `base32Decode(string)` — RFC 4648 base32, used internally for secret display.

## Design notes

- Default algorithm is SHA-1, 6 digits, 30-second step, not because it's the strongest option, but because it's what every real authenticator app (Google Authenticator, Authy, 1Password) assumes. SHA-256/SHA-512 are supported but will likely fail to scan correctly in most apps.
- Verification runs in constant time: every candidate step in the drift window is always computed and compared, with no early exit, so response timing can't reveal which step (if any) matched.

## License

MIT
