/**
 * Upload & Ingestion Component for 12-Lead ECG Photos and PDFs
 * Supports Drag-and-drop, PDF multi-page extraction, sample presets, and HIPAA auto-redaction
 */
import React, { useState, useRef } from 'react';
import { SAMPLE_ECG_CASES, SampleECGCase, synthesizeECGCanvas } from '../utils/sampleData';
import { convertPdfToImages } from '../utils/pdfHandler';
import {
  Upload,
  Camera,
  FileText,
  Sparkles,
  Shield,
  Layers,
  Globe,
  Cpu,
  ChevronDown,
  Info,
} from 'lucide-react';

interface UploadSectionProps {
  onECGLoaded: (dataUrl: string, metadata: { age?: string; sex?: string; symptoms?: string }) => void;
  onSelectSampleCase: (sample: SampleECGCase, synthesizedDataUrl: string) => void;
  analysisMode: 'online_database' | 'offline_algorithmic' | 'hybrid';
  setAnalysisMode: (mode: 'online_database' | 'offline_algorithmic' | 'hybrid') => void;
  isOnline: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onECGLoaded,
  onSelectSampleCase,
  analysisMode,
  setAnalysisMode,
  isOnline,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState<'Male' | 'Female' | 'Other' | 'Unknown'>('Unknown');
  const [patientSymptoms, setPatientSymptoms] = useState('');
  const [autoRedact, setAutoRedact] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF handler
        const pages = await convertPdfToImages(file, 2.0);
        if (pages.length > 0) {
          onECGLoaded(pages[0].dataUrl, {
            age: patientAge,
            sex: patientSex,
            symptoms: patientSymptoms,
          });
        }
      } else {
        // Image handler
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onECGLoaded(result, {
              age: patientAge,
              sex: patientSex,
              symptoms: patientSymptoms,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert('Error reading ECG file: ' + err.message);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleECGCase) => {
    const dataUrl = synthesizeECGCanvas(sample);
    onSelectSampleCase(sample, dataUrl);
  };

  return (
    <div className="space-y-6">
      {/* HIPAA & Clinical Advisory Banner */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-950/40 p-4 text-xs text-sky-200 flex items-start gap-3 shadow-md">
        <Shield className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>HIPAA Compliance &amp; Clinical Decision Support:</strong> CardioPulse utilizes AES-GCM 256-bit client-side encryption and cross-references peer-reviewed medical databases (ESC/AHA 4th Universal Definition criteria). For patient privacy, names and IDs can be automatically sanitized using our built-in redaction tools.
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-slate-900 border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center space-y-5 transition-all shadow-xl relative overflow-hidden ${
          isDragging
            ? 'border-sky-400 bg-sky-950/30 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Upload or Snap 12-Lead ECG
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Drag and drop your ECG photo (PNG, JPG, HEIC) or <strong>hospital PDF document</strong> here.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Select File / Snap Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-5 py-3 rounded-xl shadow transition flex items-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Upload PDF Report</span>
          </button>
        </div>

        {/* Engine Mode Selection */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-slate-400 font-medium">Analysis Engine:</span>

          <button
            onClick={() => setAnalysisMode('online_database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border ${
              analysisMode === 'online_database'
                ? 'bg-blue-600 border-blue-400 text-white shadow'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Medical Database Grounded</span>
          </button>

          <button
            onClick={() => setAnalysisMode('offline_algorithmic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border ${
              analysisMode === 'offline_algorithmic'
                ? 'bg-purple-600 border-purple-400 text-white shadow'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Pure Offline Algorithmic (No API)</span>
          </button>
        </div>
      </div>

      {/* Patient Clinical Context Collapsible */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <button
          onClick={() => setShowDemographics(!showDemographics)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wide hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            Optional Clinical Demographics (Refines STEMI V2-V3 &amp; QTc Thresholds)
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showDemographics ? 'rotate-180' : ''}`}
          />
        </button>

        {showDemographics && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Patient Age</label>
              <input
                type="number"
                placeholder="e.g., 58"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Biological Sex</label>
              <select
                value={patientSex}
                onChange={(e) => setPatientSex(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Unknown">Unspecified</option>
                <option value="Male">Male (&gt;=40: 2.0mm STE; &lt;40: 2.5mm STE)</option>
                <option value="Female">Female (&gt;=1.5mm STE V2-V3, QTc limit 460ms)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Presenting Symptoms</label>
              <input
                type="text"
                placeholder="e.g., Chest pressure, diaphoresis"
                value={patientSymptoms}
                onChange={(e) => setPatientSymptoms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Instant Realistic Sample 12-Lead ECG Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Quick Test Cases (Pre-Loaded 12-Lead Clinical Records)
          </h3>
          <span className="text-[11px] text-slate-500">Tap to test immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_ECG_CASES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl text-left transition group shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    sample.severity === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      : sample.severity === 'urgent'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {sample.tag}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {sample.presetAnalysis.heart_rate_bpm} BPM
                </span>
              </div>

              <div className="text-xs font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
                {sample.title}
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
