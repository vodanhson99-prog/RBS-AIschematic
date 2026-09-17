import type { UserAISettings, AIProvider, KeyStorageMode } from '../types/circuit';

const STORAGE_KEY_V2 = 'ai_circuit_secure_vault_v2';
const LEGACY_STORAGE_KEY = 'ai_circuit_studio_ai_settings';
const DEVICE_SALT_KEY = 'ai_circuit_device_salt';

/**
 * Tạo hoặc lấy Device Salt duy nhất trên trình duyệt của máy hiện tại
 */
function getOrCreateDeviceSalt(): Uint8Array {
  if (typeof window === 'undefined') return new Uint8Array(16);
  try {
    let saltHex = localStorage.getItem(DEVICE_SALT_KEY);
    if (!saltHex || saltHex.length !== 32) {
      const randomBytes = new Uint8Array(16);
      window.crypto.getRandomValues(randomBytes);
      saltHex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem(DEVICE_SALT_KEY, saltHex);
    }
    const bytes = new Uint8Array(saltHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(saltHex.substr(i * 2, 2), 16);
    }
    return bytes;
  } catch {
    return new Uint8Array(16);
  }
}

/**
 * Sinh khóa mã hóa AES-GCM 256-bit dựa trên entropy thiết bị + PBKDF2
 */
async function getDerivedEncryptionKey(): Promise<CryptoKey | null> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }
  try {
    const salt = getOrCreateDeviceSalt();
    const entropy = `${navigator.userAgent}_${navigator.language}_ai_circuit_studio_vault`;
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(entropy),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (err) {
    console.warn('Không thể khởi tạo Web Crypto key:', err);
    return null;
  }
}

/**
 * Mã hóa chuỗi nhạy cảm (API Key) bằng AES-GCM 256-bit
 */
export async function encryptSecret(plainText: string): Promise<string> {
  if (!plainText) return '';
  const cryptoKey = await getDerivedEncryptionKey();
  if (!cryptoKey || !window.crypto?.subtle) {
    // Fallback mã hóa nhẹ cho môi trường không có Web Crypto
    return `b64:${btoa(encodeURIComponent(plainText))}`;
  }

  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      enc.encode(plainText)
    );

    const ivStr = btoa(String.fromCharCode(...iv));
    const dataStr = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    return `aes-gcm:v2:${ivStr}:${dataStr}`;
  } catch (err) {
    console.warn('Lỗi mã hóa AES-GCM, sử dụng fallback an toàn:', err);
    return `b64:${btoa(encodeURIComponent(plainText))}`;
  }
}

/**
 * Giải mã API Key từ chuỗi mã hóa
 */
export async function decryptSecret(cipherText: string): Promise<string> {
  if (!cipherText) return '';

  if (cipherText.startsWith('b64:')) {
    try {
      return decodeURIComponent(atob(cipherText.slice(4)));
    } catch {
      return '';
    }
  }

  if (!cipherText.startsWith('aes-gcm:v2:')) {
    // Trường hợp chuỗi plaintext cũ còn lưu
    return cipherText;
  }

  const cryptoKey = await getDerivedEncryptionKey();
  if (!cryptoKey || !window.crypto?.subtle) return '';

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return '';
    const iv = new Uint8Array(atob(parts[2]).split('').map((c) => c.charCodeAt(0)));
    const data = new Uint8Array(atob(parts[3]).split('').map((c) => c.charCodeAt(0)));

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.warn('Giải mã thất bại (có thể do môi trường/thiết bị khác):', err);
    return '';
  }
}

/**
 * Che mờ API Key để chống nhìn trộm màn hình (Shoulder-surfing protection)
 * Ví dụ: "AIzaSy••••••••k3L9" hoặc "sk-••••••••8mPx"
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  if (trimmed.startsWith('AIzaSy')) {
    return `AIzaSy••••••••${trimmed.slice(-4)}`;
  }
  if (trimmed.startsWith('sk-ant-')) {
    return `sk-ant-••••••••${trimmed.slice(-4)}`;
  }
  if (trimmed.startsWith('sk-')) {
    return `sk-••••••••${trimmed.slice(-4)}`;
  }
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

/**
 * Kiểm tra tính hợp lệ cơ bản của định dạng API Key theo từng Provider
 */
export function validateApiKeyFormat(provider: AIProvider, key: string): { valid: boolean; warning?: string } {
  const trimmed = key.trim();
  if (!trimmed) {
    if (provider === 'custom') return { valid: true };
    return { valid: false, warning: 'Chưa nhập API Key.' };
  }

  if (trimmed.includes(' ') || trimmed.includes('\n') || trimmed.includes('\r')) {
    return { valid: false, warning: 'API Key không được chứa khoảng trắng hoặc dấu xuống dòng.' };
  }

  switch (provider) {
    case 'gemini':
      if (trimmed.startsWith('sk-')) {
        return { valid: false, warning: 'Khóa này có vẻ là của OpenAI/Claude, không phải Google Gemini (thường bắt đầu bằng AIzaSy...).' };
      }
      if (!trimmed.startsWith('AIza')) {
        return { valid: true, warning: 'Khóa Google Gemini thường bắt đầu bằng tiền tố "AIza...". Hãy kiểm tra lại nếu gặp lỗi.' };
      }
      break;

    case 'openai':
      if (trimmed.startsWith('AIza')) {
        return { valid: false, warning: 'Khóa này có vẻ là của Google Gemini, không phải OpenAI (thường bắt đầu bằng sk-...).' };
      }
      if (!trimmed.startsWith('sk-')) {
        return { valid: false, warning: 'OpenAI API Key tiêu chuẩn bắt đầu bằng "sk-...".' };
      }
      break;

    case 'anthropic':
      if (!trimmed.startsWith('sk-ant-') && !trimmed.startsWith('sk-')) {
        return { valid: true, warning: 'Anthropic Claude API Key thường bắt đầu bằng "sk-ant-...".' };
      }
      break;

    case 'deepseek':
    case 'kimi':
      if (trimmed.startsWith('AIza')) {
        return { valid: false, warning: 'Khóa này là của Google Gemini, không phải của ' + provider.toUpperCase() + '.' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Lưu cài đặt AI một cách an toàn:
 * - Nếu storageMode = 'session': Lưu vào sessionStorage (mã hóa), xóa khỏi localStorage. Tắt tab là mất!
 * - Nếu storageMode = 'local': Lưu vào localStorage (mã hóa AES-GCM 256).
 * - Nếu storageMode = 'memory': Xóa sạch khỏi cả 2 storage.
 */
export async function saveSecureAISettings(settings: UserAISettings): Promise<void> {
  const mode: KeyStorageMode = settings.storageMode || 'session';
  const encryptedKey = await encryptSecret(settings.apiKey);

  const payload = JSON.stringify({
    version: 2,
    provider: settings.provider,
    encryptedKey,
    model: settings.model,
    customBaseUrl: settings.customBaseUrl || '',
    storageMode: mode,
    updatedAt: Date.now(),
  });

  try {
    if (mode === 'session') {
      sessionStorage.setItem(STORAGE_KEY_V2, payload);
      localStorage.removeItem(STORAGE_KEY_V2);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } else if (mode === 'local') {
      localStorage.setItem(STORAGE_KEY_V2, payload);
      sessionStorage.removeItem(STORAGE_KEY_V2);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } else {
      // Memory only
      sessionStorage.removeItem(STORAGE_KEY_V2);
      localStorage.removeItem(STORAGE_KEY_V2);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Lỗi khi lưu trữ cấu hình bảo mật:', err);
  }
}

/**
 * Tải cài đặt AI bảo mật (tự động giải mã và migrate dữ liệu cũ nếu có)
 */
export async function loadSecureAISettings(defaultSettings: UserAISettings): Promise<UserAISettings> {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    // 1. Kiểm tra sessionStorage trước (Session Only có độ ưu tiên cao nhất)
    let raw = sessionStorage.getItem(STORAGE_KEY_V2);
    let isSession = true;

    // 2. Nếu không có trong session, kiểm tra localStorage
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEY_V2);
      isSession = false;
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      const decryptedKey = await decryptSecret(parsed.encryptedKey || '');
      return {
        provider: parsed.provider || defaultSettings.provider,
        apiKey: decryptedKey,
        model: parsed.model || defaultSettings.model,
        customBaseUrl: parsed.customBaseUrl || '',
        storageMode: parsed.storageMode || (isSession ? 'session' : 'local'),
      };
    }

    // 3. Fallback: Di chuyển dữ liệu cũ từ plaintext legacy nếu có
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const migrated: UserAISettings = {
        provider: legacy.provider || defaultSettings.provider,
        apiKey: legacy.apiKey || '',
        model: legacy.model || defaultSettings.model,
        customBaseUrl: legacy.customBaseUrl || '',
        storageMode: 'session', // Mặc định an toàn sang session
      };
      // Lưu lại dạng mã hóa và xóa plaintext
      await saveSecureAISettings(migrated);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  } catch (err) {
    console.warn('Lỗi khi tải hoặc giải mã cài đặt bảo mật:', err);
  }

  return defaultSettings;
}

/**
 * Xóa sạch toàn bộ API Key và dữ liệu bảo mật khỏi máy ngay lập tức (Emergency Wipe)
 */
export function clearAllStoredAISettings(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_V2);
    localStorage.removeItem(STORAGE_KEY_V2);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(DEVICE_SALT_KEY);
  } catch (err) {
    console.warn('Lỗi khi xóa dữ liệu bảo mật:', err);
  }
}
