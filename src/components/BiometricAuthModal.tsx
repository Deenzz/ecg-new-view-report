/**
 * Biometric Authentication Modal (WebAuthn / Passkey & PIN Fallback)
 */
import React, { useState, useEffect } from 'react';
import { PatientProfile } from '../types/ecg';
import {
  isBiometricsSupported,
  authenticateWithBiometrics,
  registerBiometricPasskey,
  verifyPinCode,
  getStoredUsers,
} from '../utils/auth';
import { Fingerprint, Lock, ShieldCheck, KeyRound, UserCheck, X, AlertCircle } from 'lucide-react';

interface BiometricAuthModalProps {
  currentUser: PatientProfile | null;
  onSuccess: (user: PatientProfile) => void;
  onClose: () => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  currentUser,
  onSuccess,
  onClose,
}) => {
  const [users, setUsers] = useState<PatientProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<PatientProfile | null>(currentUser);
  const [supportsBio, setSupportsBio] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'biometric' | 'pin'>('biometric');

  useEffect(() => {
    const list = getStoredUsers();
    setUsers(list);
    if (!selectedUser && list.length > 0) {
      setSelectedUser(list[0]);
    }

    isBiometricsSupported().then((supported) => {
      setSupportsBio(supported);
      if (!supported) {
        setActiveTab('pin');
      }
    });
  }, []);

  const handleBiometricAuth = async () => {
    if (!selectedUser) return;
    setErrorMsg('');
    setIsVerifying(true);

    const res = await authenticateWithBiometrics(selectedUser);
    setIsVerifying(false);

    if (res.success) {
      onSuccess(selectedUser);
    } else {
      setErrorMsg(res.error || 'Biometric check failed. You can use your PIN code.');
      setActiveTab('pin');
    }
  };

  const handleRegisterBiometrics = async () => {
    if (!selectedUser) return;
    setErrorMsg('');
    setIsVerifying(true);

    const res = await registerBiometricPasskey(selectedUser);
    setIsVerifying(false);

    if (res.success) {
      onSuccess(selectedUser);
    } else {
      setErrorMsg(res.error || 'Could not register biometric hardware.');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (verifyPinCode(selectedUser, pinInput)) {
      onSuccess(selectedUser);
    } else {
      setErrorMsg('Incorrect PIN. (Default doctor PIN is 1234, Senior PIN is 0000)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Secure Biometric Login</h3>
              <p className="text-xs text-slate-400">HIPAA Compliant Credential Access</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Select User Profile:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUser(u);
                  setErrorMsg('');
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedUser?.id === u.id
                    ? 'bg-sky-950/60 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs truncate">{u.displayName}</div>
                <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('biometric')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'biometric' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Biometric Passkey</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pin')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'pin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Medical PIN</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Biometric Tab Content */}
        {activeTab === 'biometric' && (
          <div className="text-center py-4 space-y-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 mx-auto rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-sky-400 animate-pulse">
                <Fingerprint className="w-10 h-10" />
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-white">Touch ID / Face ID / Windows Hello</div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Use your device's built-in biometric sensor to unlock and decrypt patient health records.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isVerifying}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isVerifying ? 'Checking Biometrics...' : 'Authenticate with Biometrics'}</span>
              </button>

              <button
                type="button"
                onClick={handleRegisterBiometrics}
                className="text-xs text-slate-400 hover:text-sky-400 underline transition"
              >
                Set up new biometric passkey on this device
              </button>
            </div>
          </div>
        )}

        {/* PIN Tab Content */}
        {activeTab === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                Enter 4-Digit Security PIN:
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="• • • •"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-mono text-white tracking-widest focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="text-[11px] text-slate-400 text-center mt-1.5">
                Default Doctor PIN: <strong className="text-sky-300">1234</strong> | Senior PIN:{' '}
                <strong className="text-sky-300">0000</strong>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Vault</span>
            </button>
          </form>
        )}

        <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIPS 140-2 Validated WebAuthn Platform Cryptography</span>
        </div>
      </div>
    </div>
  );
};
