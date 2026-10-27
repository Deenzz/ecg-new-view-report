/**
 * HIPAA Compliance & Security Audit Vault View
 * Displays AES-GCM 256-bit encryption status and SHA-256 verified access logs
 */
import React, { useState, useEffect } from 'react';
import { HIPAAAuditLog } from '../types/ecg';
import { getHipaaAuditLogs } from '../utils/auth';
import { ShieldCheck, Lock, Key, FileCheck, Download, Clock, User } from 'lucide-react';

export const HIPAAAuditVault: React.FC = () => {
  const [logs, setLogs] = useState<HIPAAAuditLog[]>([]);

  useEffect(() => {
    setLogs(getHipaaAuditLogs());
  }, []);

  const handleExportAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `HIPAA-Audit-Log-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* HIPAA Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>At-Rest Data Encryption</span>
          </div>
          <div className="text-xl font-bold text-white">AES-GCM 256-Bit</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All stored 12-lead ECG records in local IndexedDB are encrypted with Web Crypto AES-256 and PBKDF2 100,000 iterations.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <span>Access Control &amp; Passkeys</span>
          </div>
          <div className="text-xl font-bold text-white">FIPS 140-2 WebAuthn</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hardware biometric authentication (Touch ID / Face ID) prevents unauthorized physical device extraction.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Audit Trail Integrity</span>
          </div>
          <div className="text-xl font-bold text-white">SHA-256 Signed</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Immutable chain of custody logging each view, creation, export, and PHI de-identification event.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              HIPAA Section 164.312 Audit Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically signed events recorded on this device
            </p>
          </div>

          <button
            onClick={handleExportAuditLog}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>

        {logs.length > 0 ? (
          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-sans">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        log.action === 'CREATE_RECORD'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : log.action === 'EXPORT_REPORT'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                          : log.action === 'DELETE_RECORD'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-slate-300 font-semibold">{log.userId}</span>
                    {log.patientNameRedacted && (
                      <span className="text-slate-400 text-xs">({log.patientNameRedacted})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xl">
                    Hash: <span className="text-slate-300">{log.integrityHash.substring(0, 32)}...</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No audit records created yet. Analyze an ECG to generate the first verified log.
          </div>
        )}
      </div>
    </div>
  );
};
