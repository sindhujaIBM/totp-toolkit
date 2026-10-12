const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buffer: Buffer): string {
  let bitBuffer = 0;
  let bitsInBuffer = 0;
  let output = "";

  for (const byte of buffer) {
    bitBuffer = (bitBuffer << 8) | byte;
    bitsInBuffer += 8;

    while (bitsInBuffer >= 5) {
      const index = (bitBuffer >>> (bitsInBuffer - 5)) & 0b11111;
      output += ALPHABET[index];
      bitsInBuffer -= 5;
    }
  }

  if (bitsInBuffer > 0) {
    const index = (bitBuffer << (5 - bitsInBuffer)) & 0b11111;
    output += ALPHABET[index];
  }

  while (output.length % 8 !== 0) {
    output += "=";
  }

  return output;
}

export function base32Decode(encoded: string): Buffer {
  const clean = encoded.replace(/=+$/, "").toUpperCase();
  let bitBuffer = 0;
  let bitsInBuffer = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character: ${char}`);
    }

    bitBuffer = (bitBuffer << 5) | index;
    bitsInBuffer += 5;

    if (bitsInBuffer >= 8) {
      const byte = (bitBuffer >>> (bitsInBuffer - 8)) & 0xff;
      bytes.push(byte);
      bitsInBuffer -= 8;
    }
  }

  return Buffer.from(bytes);
}
