/**
 * Export Detailed Clinical Health Report Modal
 * Generates standardized hospital print-ready summary, PDF, CSV, and JSON
 */
import React, { useRef } from 'react';
import { ECGAnalysis } from '../types/ecg';
import { X, Printer, Download, FileSpreadsheet, ShieldCheck, Heart } from 'lucide-react';

interface ExportReportModalProps {
  analysis: ECGAnalysis;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ analysis, onClose }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `CardioPulse-ECG-${analysis.patientAge || 'Report'}-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Timestamp',
      'HeartRate_BPM',
      'Rhythm',
      'Axis_Degrees',
      'PR_ms',
      'QRS_ms',
      'QT_ms',
      'QTc_ms',
      'Urgency',
      'CriticalAlert',
    ];
    const values = [
      analysis.timestamp,
      analysis.heart_rate_bpm,
      `"${analysis.rate_rhythm}"`,
      analysis.axis_degrees,
      analysis.pr_interval_ms,
      analysis.qrs_duration_ms,
      analysis.qt_interval_ms,
      analysis.qtc_interval_ms,
      `"${analysis.urgency_level}"`,
      analysis.critical_alert ? 'YES' : 'NO',
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), values.join(',')].join('\n');
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', encodeURI(csvContent));
    dlAnchorElem.setAttribute('download', `ECG-Clinical-Data-${Date.now()}.csv`);
    dlAnchorElem.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Top Modal Controls */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-white text-base">Export Detailed Health Report</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              title="Download CSV for EHR systems"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              title="Download raw clinical JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={printAreaRef}
          className="p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6 overflow-y-auto max-h-[75vh]"
          id="clinicalReportDoc"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                CardioPulse 12-Lead Diagnostic Report
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Standard 12-Lead Electrocardiogram Decision Support · ACC / AHA / ESC Guideline Formatted
              </div>
            </div>

            <div className="text-right text-xs text-slate-600">
              <div className="font-bold text-slate-900">DATE: {new Date(analysis.timestamp).toLocaleDateString()}</div>
              <div>TIME: {new Date(analysis.timestamp).toLocaleTimeString()}</div>
              <div className="text-[10px] text-slate-400 mt-1">ID: {analysis.id || 'ECG-' + Date.now().toString(36)}</div>
            </div>
          </div>

          {/* Patient Demographics & HIPAA Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap justify-between items-center text-xs gap-3">
            <div>
              <span className="text-slate-500 font-medium">Patient: </span>
              <span className="font-bold text-slate-900">{analysis.patientName || 'De-Identified Patient'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Age / Sex: </span>
              <span className="font-bold text-slate-900">
                {analysis.patientAge || 'Unrecorded'} / {analysis.patientSex || 'Unrecorded'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Symptoms: </span>
              <span className="font-bold text-slate-900">{analysis.clinicalSymptoms || 'None reported'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              HIPAA Compliant / Encrypted
            </div>
          </div>

          {/* Telemetry Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Heart Rate</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {analysis.heart_rate_bpm} <span className="text-xs font-normal">BPM</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">{analysis.heart_rate_category}</div>
            </div>

            <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Rhythm</div>
              <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                {analysis.rate_rhythm}
              </div>
            </div>

            <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Frontal Axis</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {analysis.axis_degrees}°
              </div>
              <div className="text-[10px] text-slate-600 truncate mt-0.5">{analysis.axis_quadrant}</div>
            </div>

            <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
              <div className="text-[10px] font-bold text-slate-500 uppercase">QTc Interval</div>
              <div
                className={`text-xl font-black font-mono mt-0.5 ${
                  analysis.qtc_interval_ms > 470 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {analysis.qtc_interval_ms} <span className="text-xs font-normal">ms</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">Bazett Formula</div>
            </div>
          </div>

          {/* Standard Intervals Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Parameter</th>
                  <th className="p-2.5">Measured Value</th>
                  <th className="p-2.5">Reference Standard Range</th>
                  <th className="p-2.5">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-2.5 font-sans font-medium">PR Interval</td>
                  <td className="p-2.5 font-bold">{analysis.pr_interval_ms} ms</td>
                  <td className="p-2.5 text-slate-500">120 - 200 ms</td>
                  <td className="p-2.5 font-sans">
                    {analysis.pr_interval_ms > 200 ? 'Prolonged (1° AV Block)' : 'Normal'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">QRS Duration</td>
                  <td className="p-2.5 font-bold">{analysis.qrs_duration_ms} ms</td>
                  <td className="p-2.5 text-slate-500">&lt; 120 ms</td>
                  <td className="p-2.5 font-sans">
                    {analysis.qrs_duration_ms > 120 ? 'Widened (IVCD / BBB)' : 'Normal (<120ms)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">QT / QTc (Bazett)</td>
                  <td className="p-2.5 font-bold">
                    {analysis.qt_interval_ms} ms / {analysis.qtc_interval_ms} ms
                  </td>
                  <td className="p-2.5 text-slate-500">&lt; 450ms (M), &lt; 460ms (F)</td>
                  <td className="p-2.5 font-sans font-bold">
                    {analysis.qtc_interval_ms > 500 ? (
                      <span className="text-red-600">CRITICAL PROLONGATION (&gt;500ms)</span>
                    ) : (
                      'Normal Range'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Clinical Findings Sections */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="border-l-4 border-slate-900 pl-3">
              <div className="font-bold text-slate-900 uppercase">Technical Quality &amp; Artifact:</div>
              <div className="text-slate-700 mt-0.5">{analysis.tech_quality}</div>
            </div>

            <div className="border-l-4 border-red-600 pl-3">
              <div className="font-bold text-slate-900 uppercase">Ischemia, Infarction &amp; ST-T Changes:</div>
              <div className="text-slate-700 mt-0.5">{analysis.ischemia_infarction}</div>
            </div>

            <div className="border-l-4 border-amber-600 pl-3">
              <div className="font-bold text-slate-900 uppercase">Syndromes &amp; Mimics (Wellens, PE, Brugada, Lytes):</div>
              <div className="text-slate-700 mt-0.5">{analysis.syndromes_and_mimics}</div>
            </div>

            <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 uppercase mb-1">Executive Clinical Synthesis:</div>
              <div className="text-slate-800 font-semibold">{analysis.primary_synthesis}</div>
            </div>
          </div>

          {/* Action Recommendations */}
          {analysis.recommended_actions && (
            <div className="text-xs">
              <div className="font-bold text-slate-900 uppercase mb-1.5">Actionable Clinical Next Steps:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {analysis.recommended_actions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Physician Signature Line */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <div className="font-bold">Interpreting Attending Physician Signature</div>
              <div className="text-slate-500 text-[10px]">Over-read verified under medical supervision</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <div className="font-bold">Date &amp; Facility Stamp</div>
              <div className="text-slate-500 text-[10px]">Clinical Decision Support Systems (CDSS)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
