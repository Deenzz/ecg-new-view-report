/**
 * IndexedDB Offline Medical Records Storage with AES-GCM 256-bit Encryption
 */
import { ECGAnalysis } from '../types/ecg';
import { encryptData, decryptData } from './security';
import { logHipaaEvent } from './auth';

const DB_NAME = 'CardioPulse_Encrypted_V1';
const STORE_NAME = 'ecg_records';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an ECG record securely (encrypted in IndexedDB)
 */
export async function saveECGRecord(record: ECGAnalysis, userId = 'dr-hafizuddin-01'): Promise<string> {
  const db = await openDB();
  const id = record.id || 'ecg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  const fullRecord: ECGAnalysis = { ...record, id };

  // Encrypt record data
  const encryptedPayload = await encryptData(fullRecord);

  const entry = {
    id,
    timestamp: record.timestamp,
    patientNameRedacted: record.patientName ? record.patientName.replace(/^(.).*(.)$/, '$1***$2') : 'Anonymous',
    heart_rate_bpm: record.heart_rate_bpm,
    rate_rhythm: record.rate_rhythm,
    urgency_level: record.urgency_level,
    critical_alert: record.critical_alert,
    encryptedData: encryptedPayload,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);

    req.onsuccess = async () => {
      await logHipaaEvent({
        action: 'CREATE_RECORD',
        recordId: id,
        patientNameRedacted: entry.patientNameRedacted,
        userId,
        deviceInfo: navigator.userAgent,
      });
      resolve(id);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all ECG records for historical trend visualization (decrypted)
 */
export async function getAllECGRecords(userId = 'dr-hafizuddin-01'): Promise<ECGAnalysis[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = async () => {
      const entries = req.result || [];
      const decryptedRecords: ECGAnalysis[] = [];

      for (const entry of entries) {
        try {
          if (entry.encryptedData) {
            const dec = await decryptData<ECGAnalysis>(entry.encryptedData);
            decryptedRecords.push(dec);
          }
        } catch (err) {
          console.warn('Could not decrypt record:', entry.id, err);
        }
      }

      // Sort chronological descending
      decryptedRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (decryptedRecords.length > 0) {
        logHipaaEvent({
          action: 'VIEW_RECORD',
          userId,
          deviceInfo: navigator.userAgent,
        });
      }

      resolve(decryptedRecords);
    };

    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete an ECG record
 */
export async function deleteECGRecord(id: string, userId = 'dr-hafizuddin-01'): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = async () => {
      await logHipaaEvent({
        action: 'DELETE_RECORD',
        recordId: id,
        userId,
        deviceInfo: navigator.userAgent,
      });
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}
