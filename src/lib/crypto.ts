/**
 * Shared encryption for password-protected case studies.
 *
 * Runs in two places and must behave identically in both:
 *  - the build (Node, via `integrations/protect.ts`) to encrypt rendered HTML
 *  - the browser, to decrypt it after the visitor enters the password
 *
 * The password is never stored, hashed or compared. The derived AES key either
 * decrypts the ciphertext or it doesn't, so there is no hash to attack and no
 * bypass that skips the check.
 */

export const ITERATIONS = 210_000;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;

export interface EncryptedPayload {
  v: 1;
  /** base64 */
  salt: string;
  /** base64 */
  iv: string;
  iterations: number;
  /** base64 AES-GCM ciphertext */
  data: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
  extractable: boolean,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    extractable,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptHtml(html: string, password: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(SALT_BYTES)));
  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(IV_BYTES)));
  const key = await deriveKey(password, salt, ITERATIONS, false);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(html),
  );

  return {
    v: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    iterations: ITERATIONS,
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

/**
 * Decrypts with a password. Returns null when the password is wrong, which
 * AES-GCM reports as a failed authentication tag rather than a distinct error.
 */
export async function decryptWithPassword(
  payload: EncryptedPayload,
  password: string,
  extractable = false,
): Promise<{ html: string; key: CryptoKey } | null> {
  try {
    const key = await deriveKey(
      password,
      base64ToBytes(payload.salt),
      payload.iterations,
      extractable,
    );

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(payload.iv) },
      key,
      base64ToBytes(payload.data),
    );

    return { html: decoder.decode(plaintext), key };
  } catch {
    return null;
  }
}

/** Re-opens a session that was unlocked earlier, using the stored raw key. */
export async function decryptWithKey(
  payload: EncryptedPayload,
  rawKey: Uint8Array<ArrayBuffer>,
): Promise<string | null> {
  try {
    const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, [
      'decrypt',
    ]);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(payload.iv) },
      key,
      base64ToBytes(payload.data),
    );
    return decoder.decode(plaintext);
  } catch {
    return null;
  }
}

export async function exportRawKey(key: CryptoKey): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.exportKey('raw', key));
}
