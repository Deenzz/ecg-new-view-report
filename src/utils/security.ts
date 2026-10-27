/**
 * HIPAA Compliance & Security Utilities
 * Implements AES-GCM 256-bit client-side encryption and SHA-256 integrity hashing
 */

// Generate a deterministic or persistent device salt
const STORAGE_SALT_KEY = 'cardiopulse_sec_salt_v1';

function getOrGenerateSalt(): Uint8Array {
  const existing = localStorage.getItem(STORAGE_SALT_KEY);
  if (existing) {
    return new Uint8Array(JSON.parse(existing));
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(STORAGE_SALT_KEY, JSON.stringify(Array.from(salt)));
  return salt;
}

// Derive AES-GCM 256-bit CryptoKey from passphrase/device token using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

const DEFAULT_VAULT_PASSPHRASE = 'CardioPulse-HIPAA-AES256-Vault-Key-2026';

/**
 * Encrypt arbitrary object into AES-GCM 256-bit ciphertext
 */
export async function encryptData(data: any, customPassphrase = DEFAULT_VAULT_PASSPHRASE): Promise<string> {
  const salt = getOrGenerateSalt();
  const key = await deriveKey(customPassphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypt AES-GCM 256-bit ciphertext back to object
 */
export async function decryptData<T = any>(encryptedString: string, customPassphrase = DEFAULT_VAULT_PASSPHRASE): Promise<T> {
  try {
    const payload = JSON.parse(encryptedString);
    const salt = getOrGenerateSalt();
    const key = await deriveKey(customPassphrase, salt);
    const iv = new Uint8Array(payload.iv);
    const ciphertext = new Uint8Array(payload.data);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Failed to decrypt medical record. Key mismatch or corrupted ciphertext.');
  }
}

/**
 * Generate SHA-256 hash for HIPAA audit trail verification
 */
export async function generateAuditHash(content: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(content));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Redact Patient PHI from an image canvas by applying a solid anonymization box or blur
 */
export function applyRedactionToCanvas(
  canvas: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number; label?: string }
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  // Fill solid dark box
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(box.x, box.y, box.width, box.height);

  // Border
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Redaction watermark
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    box.label || '[DE-IDENTIFIED / HIPAA PHI REDACTED]',
    box.x + box.width / 2,
    box.y + box.height / 2
  );
  ctx.restore();
}
