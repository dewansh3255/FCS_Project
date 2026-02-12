// src/utils/crypto.ts

/**
 * MEMBER B: CRYPTO MODULE
 * -----------------------
 * Responsible for generating keys, encrypting messages, and signing data.
 * Algorithm: RSA-OAEP (for encryption) with SHA-256.
 * Modulus Length: 2048 bits (Secure standard).
 */

// 1. Generate an RSA Key Pair (Public & Private)
export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: "SHA-256",
      },
      true, // extractable (Must be true so we can save it to DB later)
      ["encrypt", "decrypt"] // usages
    );

    return keyPair;
  } catch (error) {
    console.error("Error generating key pair:", error);
    throw error;
  }
};

// 2. Export Key (Convert raw crypto object to format we can store/log)
// Format: "spki" for Public Key, "pkcs8" for Private Key
export const exportKey = async (key: CryptoKey): Promise<string> => {
  const format = key.type === "private" ? "pkcs8" : "spki";
  
  const exported = await window.crypto.subtle.exportKey(
    format,
    key
  );

  return arrayBufferToBase64(exported);
};

// Helper: Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// src/utils/crypto.ts (Add to bottom)

// 3. Import Password as a Key (PBKDF2 Wrapper)
const getPasswordKey = async (password: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return keyMaterial;
};

// 4. Encrypt Private Key with Password (AES-GCM)
export const encryptPrivateKey = async (privateKeyBase64: string, password: string): Promise<string> => {
  try {
    const keyMaterial = await getPasswordKey(password);
    const salt = window.crypto.getRandomValues(new Uint8Array(16)); // Random salt
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Random IV

    // Derive the AES Key from Password
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000, // High iteration count for security
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    // Encrypt the Private Key
    const enc = new TextEncoder();
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      enc.encode(privateKeyBase64)
    );

    // Pack everything into a single string: salt + iv + ciphertext
    // Format: base64(salt) . base64(iv) . base64(ciphertext)
    const saltB64 = arrayBufferToBase64(salt);
    const ivB64 = arrayBufferToBase64(iv);
    const contentB64 = arrayBufferToBase64(encryptedContent);

    return `${saltB64}.${ivB64}.${contentB64}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
};