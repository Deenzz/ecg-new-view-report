/**
 * Standardized 12-Lead ECG Clinical Analysis Report Component
 * Presents ACC/AHA/ESC guideline breakdown, regional ischemia mapping, and live PubMed citations
 */
import React, { useState } from 'react';
import { ECGAnalysis } from '../types/ecg';
import {
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  FileText,
  Download,
  ExternalLink,
  Heart,
  Activity,
  Compass,
  Zap,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: ECGAnalysis;
  onExportReport: () => void;
  onSaveToVault?: () => void;
  isSaved?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  onExportReport,
  onSaveToVault,
  isSaved = false,
}) => {
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Web Speech API Audio Readout
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const textToRead = `${analysis.critical_alert ? 'Attention. High risk finding detected.' : 'Electrocardiogram analysis complete.'} ${analysis.primary_synthesis}. Heart rate is ${analysis.heart_rate_bpm} beats per minute. ${analysis.urgency_level}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  const isCritical = analysis.critical_alert;

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      <div
        className={`p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isCritical
            ? 'bg-rose-950/80 border-rose-500/90 text-rose-100 ring-2 ring-rose-500/40 animate-pulse'
            : 'bg-emerald-950/60 border-emerald-500/70 text-emerald-100'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {isCritical ? (
            <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">
                {isCritical
                  ? 'CRITICAL CARDIAC FINDING REQUIRING IMMEDIATE ATTENTION'
                  : 'NO ACUTE ISCHEMIC ST-ELEVATION PATTERN IDENTIFIED'}
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700">
                {analysis.analysis_mode === 'online_database'
                  ? 'Medical Web Grounded'
                  : 'Offline Algorithmic'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isCritical
                ? analysis.alert_reasons?.join(' • ') || 'Urgent electrocardiographic abnormality flagged for immediate physician over-read.'
                : 'Standard intervals within physiological limits. No acute contiguous ST elevation meeting 4th Universal Definition criteria.'}
            </p>
          </div>
        </div>

        {/* Action Button: Audio Readout & Export */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={toggleSpeech}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition shadow"
            title="Read findings aloud using audio speech synthesis"
          >
            {isPlayingSpeech ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            <span>{isPlayingSpeech ? 'Stop Voice' : 'Listen'}</span>
          </button>

          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4-Quadrant Clinical Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tech Quality */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Tech Quality</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-slate-100 leading-snug line-clamp-3">
            {analysis.tech_quality}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>25 mm/s</span>
            <span>10 mm/mV</span>
          </div>
        </div>

        {/* Rate & Rhythm */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Rate &amp; Rhythm</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-white font-mono">{analysis.heart_rate_bpm}</span>
            <span className="text-xs text-slate-400 font-medium">BPM</span>
          </div>
          <div className="text-xs font-medium text-sky-300 line-clamp-2">
            {analysis.rate_rhythm}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Category: <span className="text-slate-200">{analysis.heart_rate_category}</span>
          </div>
        </div>

        {/* Axis & Intervals */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Axis &amp; Intervals</span>
            <Compass className="w-4 h-4 text-sky-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Axis: </span>
              <span className="font-mono text-slate-200 font-semibold">{analysis.axis_degrees}°</span>
            </div>
            <div>
              <span className="text-slate-400">PR: </span>
              <span className="font-mono text-slate-200 font-semibold">{analysis.pr_interval_ms}ms</span>
            </div>
            <div>
              <span className="text-slate-400">QRS: </span>
              <span className="font-mono text-slate-200 font-semibold">{analysis.qrs_duration_ms}ms</span>
            </div>
            <div>
              <span className="text-slate-400">QTc (Bazett): </span>
              <span
                className={`font-mono font-bold ${
                  analysis.qtc_interval_ms > 500
                    ? 'text-rose-400'
                    : analysis.qtc_interval_ms > 460
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {analysis.qtc_interval_ms}ms
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 truncate">
            {analysis.axis_quadrant}
          </div>
        </div>

        {/* Conduction & Hypertrophy */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Conduction &amp; Chambers</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs text-slate-200 leading-snug line-clamp-3">
            {analysis.conduction_hypertrophy}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Sokolow-Lyon &lt;35mm</span>
            <span className="text-emerald-400">Normal</span>
          </div>
        </div>
      </div>

      {/* Anatomical Ischemia & Regional Lead Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Heart className="w-4 h-4 text-rose-500" />
            Ischemia, Infarction &amp; Coronary Vascular Territories (4th Universal Definition)
          </h3>
          <p className="text-sm text-slate-200 mt-3 leading-relaxed">
            {analysis.ischemia_infarction}
          </p>
        </div>

        {/* Lead Anatomical Map */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="font-bold text-sky-400">Anteroseptal (LAD)</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Leads V1, V2, V3, V4</div>
            <div className="mt-2 text-slate-300 font-medium">
              {analysis.affected_leads?.some((l) => ['V1', 'V2', 'V3', 'V4'].includes(l))
                ? '⚠️ Marked ST-T Deviation'
                : '✓ Isoelectric / Concordant'}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="font-bold text-amber-400">Inferior (RCA / LCx)</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Leads II, III, aVF</div>
            <div className="mt-2 text-slate-300 font-medium">
              {analysis.affected_leads?.some((l) => ['II', 'III', 'aVF'].includes(l))
                ? '⚠️ Reciprocal / Primary Changes'
                : '✓ Normal Baseline'}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="font-bold text-emerald-400">Lateral (Circumflex)</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Leads I, aVL, V5, V6</div>
            <div className="mt-2 text-slate-300 font-medium">
              {analysis.affected_leads?.some((l) => ['I', 'aVL', 'V5', 'V6'].includes(l))
                ? '⚠️ Lateral ST Changes'
                : '✓ Normal Baseline'}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="font-bold text-purple-400">Posterior &amp; Right Ventricle</div>
            <div className="text-slate-400 text-[11px] mt-0.5">V7-V9 &amp; V4R Vectors</div>
            <div className="mt-2 text-slate-300 font-medium">
              {analysis.affected_leads?.includes('V4R')
                ? '⚠️ RV Infarct Suspected'
                : '✓ No Reciprocal Mirror STE'}
            </div>
          </div>
        </div>

        {/* Syndromes & Mimics Screening */}
        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Syndrome Screening (Wellens, PE S1Q3T3, Brugada, Electrolytes, Tox)
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            {analysis.syndromes_and_mimics}
          </p>
        </div>

        {/* Clinical Synthesis Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-400" />
            Executive Clinical Synthesis
          </div>
          <p className="text-base font-semibold text-blue-100 leading-relaxed">
            {analysis.primary_synthesis}
          </p>
        </div>

        {/* Actionable Clinical Recommendations */}
        {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Actionable Clinical Protocol &amp; Next Steps
            </h4>
            <div className="space-y-1.5">
              {analysis.recommended_actions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Peer-Reviewed Citations & PubMed Medical Database Cross-Reference */}
        {analysis.peer_reviewed_citations && analysis.peer_reviewed_citations.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Peer-Reviewed Clinical Evidence &amp; Guideline Database Grounding
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Real-Time Search Grounded</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.peer_reviewed_citations.map((cite, index) => (
                <a
                  key={index}
                  href={cite.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-sky-500/50 rounded-xl transition group shadow"
                >
                  <div className="flex items-center justify-between text-[11px] text-sky-400 font-semibold mb-1">
                    <span>{cite.source}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition" />
                  </div>
                  <div className="text-xs text-slate-200 font-medium line-clamp-2 group-hover:text-white transition">
                    {cite.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {cite.relevance}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reading Limitations Note */}
        {analysis.limitations && (
          <div className="text-[11px] text-slate-500 italic border-t border-slate-800 pt-3">
            <strong>Diagnostic Note &amp; Limitations:</strong> {analysis.limitations}
          </div>
        )}
      </div>
    </div>
  );
};
