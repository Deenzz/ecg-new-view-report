/**
 * Historical Health Trends & Long-Term Monitoring Dashboard
 * Interactive trend visualization for Heart Rate, QTc interval, and Arrhythmia history
 */
import React, { useState } from 'react';
import { ECGAnalysis } from '../types/ecg';
import {
  Activity,
  Heart,
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
  FileText,
  Eye,
  Filter,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface HealthTrendsDashboardProps {
  records: ECGAnalysis[];
  onSelectRecord: (record: ECGAnalysis) => void;
  onDeleteRecord: (id: string) => void;
  onExportRecord: (record: ECGAnalysis) => void;
}

export const HealthTrendsDashboard: React.FC<HealthTrendsDashboardProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onExportRecord,
}) => {
  const [filter, setFilter] = useState<'all' | 'alerts_only' | 'normal'>('all');

  // Chronological ascending for charts
  const chronologicalRecords = [...records].reverse();

  // Summary statistics
  const totalCount = records.length;
  const criticalCount = records.filter((r) => r.critical_alert).length;
  const avgHr =
    totalCount > 0
      ? Math.round(records.reduce((acc, r) => acc + (r.heart_rate_bpm || 70), 0) / totalCount)
      : 72;
  const avgQtc =
    totalCount > 0
      ? Math.round(records.reduce((acc, r) => acc + (r.qtc_interval_ms || 420), 0) / totalCount)
      : 420;

  // Filtered table list
  const filteredRecords = records.filter((r) => {
    if (filter === 'alerts_only') return r.critical_alert;
    if (filter === 'normal') return !r.critical_alert;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Total ECGs</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Encrypted in Local Vault</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Avg Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {avgHr} <span className="text-xs text-slate-400 font-sans">BPM</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target: 60-100 BPM</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Mean QTc Interval</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              avgQtc > 470 ? 'text-rose-400' : avgQtc > 450 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {avgQtc} <span className="text-xs text-slate-400 font-sans">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Danger Limit: &gt;500ms</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Critical Irregularities</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              criticalCount > 0 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">STEMI / High-Risk Triage</div>
        </div>
      </div>

      {/* Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              Heart Rate Progression (BPM)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Normal Band (60-100)</span>
          </div>

          {chronologicalRecords.length >= 2 ? (
            <div className="relative h-48 w-full bg-slate-950 rounded-xl p-3 border border-slate-800/80">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                {/* Safe Range 60-100 BPM Band */}
                <rect x="0" y="45" width="500" height="60" fill="#10b981" fillOpacity="0.08" />
                <line x1="0" y1="45" x2="500" y2="45" stroke="#10b981" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="105" x2="500" y2="105" stroke="#10b981" strokeDasharray="3 3" opacity="0.3" />

                {/* Plot line */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chronologicalRecords
                    .map((r, i) => {
                      const x = (i / (chronologicalRecords.length - 1)) * 460 + 20;
                      // Range 40 to 160 bpm -> y: 140 to 20
                      const clamped = Math.max(40, Math.min(160, r.heart_rate_bpm || 70));
                      const y = 140 - ((clamped - 40) / 120) * 120;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Plot dots */}
                {chronologicalRecords.map((r, i) => {
                  const x = (i / (chronologicalRecords.length - 1)) * 460 + 20;
                  const clamped = Math.max(40, Math.min(160, r.heart_rate_bpm || 70));
                  const y = 140 - ((clamped - 40) / 120) * 120;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={r.critical_alert ? '#ef4444' : '#f43f5e'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {r.heart_rate_bpm}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
              Record at least two ECGs to visualize long-term heart rate trend graph.
            </div>
          )}
        </div>

        {/* QTc Interval Stability & Torsades Risk Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              QTc Interval Trend (Bazett Formula)
            </h3>
            <span className="text-xs text-rose-400 font-mono">Critical: &gt;500ms</span>
          </div>

          {chronologicalRecords.length >= 2 ? (
            <div className="relative h-48 w-full bg-slate-950 rounded-xl p-3 border border-slate-800/80">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                {/* 500ms Critical Danger Line */}
                <line x1="0" y1="35" x2="500" y2="35" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="490" y="30" textAnchor="end" fill="#f87171" fontSize="9" fontWeight="bold">
                  Danger &gt;500ms
                </text>

                {/* 450ms Normal Boundary */}
                <line x1="0" y1="85" x2="500" y2="85" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <text x="490" y="80" textAnchor="end" fill="#34d399" fontSize="9">
                  Normal 450ms
                </text>

                {/* Plot line */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chronologicalRecords
                    .map((r, i) => {
                      const x = (i / (chronologicalRecords.length - 1)) * 460 + 20;
                      // Range 350 to 550 ms -> y: 140 to 20
                      const clamped = Math.max(350, Math.min(550, r.qtc_interval_ms || 420));
                      const y = 140 - ((clamped - 350) / 200) * 120;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Plot dots */}
                {chronologicalRecords.map((r, i) => {
                  const x = (i / (chronologicalRecords.length - 1)) * 460 + 20;
                  const clamped = Math.max(350, Math.min(550, r.qtc_interval_ms || 420));
                  const y = 140 - ((clamped - 350) / 200) * 120;
                  const isHigh = r.qtc_interval_ms > 470;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={isHigh ? '#ef4444' : '#38bdf8'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {r.qtc_interval_ms}ms
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
              Record at least two ECGs to visualize long-term QTc interval stability.
            </div>
          )}
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              Saved 12-Lead ECG Records &amp; Medical Consultation History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Encrypted offline with AES-GCM 256-bit HIPAA compliant storage
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('alerts_only')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filter === 'alerts_only' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alerts ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filter === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal ({totalCount - criticalCount})
            </button>
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-slate-800 border-t border-slate-800">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {rec.critical_alert ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        {rec.patientName || 'Patient ECG Record'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rec.critical_alert
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        }`}
                      >
                        {rec.urgency_level}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3 font-mono">
                      <span>{new Date(rec.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-rose-400 font-bold">{rec.heart_rate_bpm} BPM</span>
                      <span>•</span>
                      <span>QTc: {rec.qtc_interval_ms}ms</span>
                      <span>•</span>
                      <span className="text-sky-300 truncate max-w-xs">{rec.rate_rhythm}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelectRecord(rec)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                    title="View 12-lead reading"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onExportRecord(rec)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                    title="Export Clinical PDF / Report"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </button>

                  {rec.id && (
                    <button
                      onClick={() => onDeleteRecord(rec.id!)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No saved medical records matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
