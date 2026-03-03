import CryptoJS from "crypto-js";

function shuffleString(str: string): string {
  const a = str.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
}

function createToken(opts: { length: number; alphabet: string }): string {
  const { length, alphabet } = opts;
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function base32toHex(base32: string): string {
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = base32
    .toUpperCase()
    .replace(/=+$/, "")
    .split("")
    .map((c) => base32Chars.indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  return (bits.match(/.{1,8}/g) ?? []).map((chunk) => Number.parseInt(chunk, 2).toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): number[] {
  return (hex.match(/.{1,2}/g) ?? []).map((c) => Number.parseInt(c, 16));
}

function computeHMACSha1(message: string, keyHex: string): string {
  return CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(message), CryptoJS.enc.Hex.parse(keyHex)).toString(CryptoJS.enc.Hex);
}

export function generateHOTP(key: string, counter: number): string {
  const keyHex = base32toHex(key);
  const digest = computeHMACSha1(counter.toString(16).padStart(16, "0"), keyHex);
  const bytes = hexToBytes(digest);
  const offset = bytes[19] & 0xf;
  const v =
    ((bytes[offset] & 0x7f) << 24) |
    ((bytes[offset + 1] & 0xff) << 16) |
    ((bytes[offset + 2] & 0xff) << 8) |
    (bytes[offset + 3] & 0xff);
  return String(v % 1000000).padStart(6, "0");
}

export function getCounterFromTime(now: number, timeStep: number): number {
  return Math.floor(now / 1000 / timeStep);
}

export function generateTOTP(key: string, now: number = Date.now(), timeStep: number = 30): string {
  const counter = getCounterFromTime(now, timeStep);
  return generateHOTP(key, counter);
}

export function buildKeyUri(opts: {
  secret: string;
  app?: string;
  account?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}): string {
  const { secret, app = "IT-Tools", account = "demo-user", algorithm = "SHA1", digits = 6, period = 30 } = opts;
  const params = new URLSearchParams({
    issuer: app,
    secret,
    algorithm,
    digits: String(digits),
    period: String(period),
  });
  return `otpauth://totp/${encodeURIComponent(app)}:${encodeURIComponent(account)}?${params.toString()}`;
}

export function generateSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  return shuffleString(createToken({ length: 16, alphabet }));
}
