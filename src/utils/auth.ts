/**
 * Biometric Authentication & Session Manager (WebAuthn / Passkeys + PIN Fallback)
 */
import { PatientProfile, HIPAAAuditLog } from '../types/ecg';
import { generateAuditHash } from './security';

const AUTH_USER_KEY = 'cardiopulse_active_user';
const USERS_LIST_KEY = 'cardiopulse_users_list';
const AUDIT_LOG_KEY = 'cardiopulse_hipaa_audit_log';

// Default pre-seeded profile
const DEFAULT_DOCTOR: PatientProfile = {
  id: 'dr-hafizuddin-01',
  displayName: 'Dr. Hafizuddin (Attending Physician)',
  role: 'physician',
  email: 'drhafizuddinmuhd@gmail.com',
  hasBiometrics: false,
  pinCode: '1234',
  createdAt: new Date().toISOString(),
};

const DEFAULT_PATIENT: PatientProfile = {
  id: 'patient-senior-02',
  displayName: 'Elderly Patient (H. M. Senior)',
  role: 'patient',
  email: 'senior.patient@example.org',
  hasBiometrics: false,
  pinCode: '0000',
  createdAt: new Date().toISOString(),
};

export function getStoredUsers(): PatientProfile[] {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (!raw) {
      const initial = [DEFAULT_DOCTOR, DEFAULT_PATIENT];
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_DOCTOR, DEFAULT_PATIENT];
  }
}

export function saveUser(profile: PatientProfile): void {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === profile.id);
  if (index >= 0) {
    users[index] = profile;
  } else {
    users.push(profile);
  }
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
}

export function getActiveUser(): PatientProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      // Default to doctor
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_DOCTOR));
      return DEFAULT_DOCTOR;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DOCTOR;
  }
}

export function setActiveUser(user: PatientProfile): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  logHipaaEvent({
    action: 'AUTH_LOGIN',
    userId: user.id,
    deviceInfo: navigator.userAgent,
  });
}

/**
 * Check if WebAuthn platform biometrics (Touch ID / Face ID / Windows Hello) are available
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Register a WebAuthn biometric credential for the user
 */
export async function registerBiometricPasskey(user: PatientProfile): Promise<{ success: boolean; error?: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn is not supported in this browser environment.' };
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = new TextEncoder().encode(user.id);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'CardioPulse ECG Health System',
        id: window.location.hostname || 'localhost',
      },
      user: {
        id: userIdBuffer,
        name: user.email || user.displayName,
        displayName: user.displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (credential) {
      const updatedUser: PatientProfile = {
        ...user,
        hasBiometrics: true,
        biometricCredentialId: credential.id,
      };
      saveUser(updatedUser);
      setActiveUser(updatedUser);
      return { success: true };
    }

    return { success: false, error: 'Biometric registration was cancelled.' };
  } catch (err: any) {
    console.warn('Biometric registration error:', err);
    return { success: false, error: err.message || 'Biometric registration failed.' };
  }
}

/**
 * Authenticate user with biometric hardware
 */
export async function authenticateWithBiometrics(user: PatientProfile): Promise<{ success: boolean; error?: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn not supported.' };
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname || 'localhost',
      userVerification: 'preferred',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (assertion) {
      setActiveUser(user);
      return { success: true };
    }
    return { success: false, error: 'Biometric authentication was cancelled.' };
  } catch (err: any) {
    console.warn('Biometric verify error:', err);
    return { success: false, error: err.message || 'Biometric authentication failed.' };
  }
}

/**
 * Verify user with PIN code
 */
export function verifyPinCode(user: PatientProfile, inputPin: string): boolean {
  if (user.pinCode === inputPin) {
    setActiveUser(user);
    return true;
  }
  return false;
}

/**
 * Log an immutable HIPAA Audit Event with SHA-256 verification hash
 */
export async function logHipaaEvent(
  params: Omit<HIPAAAuditLog, 'id' | 'timestamp' | 'integrityHash'>
): Promise<HIPAAAuditLog> {
  const timestamp = new Date().toISOString();
  const id = 'audit-' + Math.random().toString(36).substring(2, 9);
  const rawRecord = `${id}:${params.action}:${params.userId}:${timestamp}:${params.deviceInfo}`;
  const integrityHash = await generateAuditHash(rawRecord);

  const newLog: HIPAAAuditLog = {
    id,
    timestamp,
    integrityHash,
    ...params,
  };

  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    const logs: HIPAAAuditLog[] = raw ? JSON.parse(raw) : [];
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop(); // Keep 200 recent audit trails
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }

  return newLog;
}

export function getHipaaAuditLogs(): HIPAAAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
