/**
 * CardioPulse 12-Lead ECG Copilot & Heart Health Monitor
 * Main Application Orchestration
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ECGViewer } from './components/ECGViewer';
import { AnalysisResults } from './components/AnalysisResults';
import { ElderlyView } from './components/ElderlyView';
import { HealthTrendsDashboard } from './components/HealthTrendsDashboard';
import { ExportReportModal } from './components/ExportReportModal';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { MedicalDatabaseModal } from './components/MedicalDatabaseModal';
import { HIPAAAuditVault } from './components/HIPAAAuditVault';
import { ECGAnalysis, CaliperMeasurement, PatientProfile } from './types/ecg';
import { SampleECGCase } from './utils/sampleData';
import { analyzeECGOffline } from './utils/offlineEcgEngine';
import { getAllECGRecords, saveECGRecord, deleteECGRecord } from './utils/db';
import { getActiveUser, setActiveUser } from './utils/auth';
import { sendIrregularityAlert, requestNotificationPermission } from './utils/notifications';
import { Loader2, ArrowLeft, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'dashboard' | 'database' | 'audit'>('analysis');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentUser, setCurrentUser] = useState<PatientProfile | null>(null);
  const [isSeniorMode, setIsSeniorMode] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Analysis State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<ECGAnalysis | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'online_database' | 'offline_algorithmic' | 'hybrid'>('online_database');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caliperMeasurements, setCaliperMeasurements] = useState<CaliperMeasurement[]>([]);
  const [isSavedInVault, setIsSavedInVault] = useState(false);

  // Stored Records for Trend Dashboard
  const [records, setRecords] = useState<ECGAnalysis[]>([]);

  // Connectivity and user init
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const user = getActiveUser();
    setCurrentUser(user);

    // Request notification permissions gracefully on user interaction
    requestNotificationPermission();

    // Load initial encrypted records from IndexedDB
    loadRecords();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadRecords = async () => {
    try {
      const stored = await getAllECGRecords();
      setRecords(stored);
    } catch (e) {
      console.warn('Error loading records:', e);
    }
  };

  // Run ECG Analysis (Online Medical Grounding or Pure Offline Algorithmic)
  const runAnalysis = async (
    imageDataUrl: string,
    patientContext: { age?: string; sex?: string; symptoms?: string } = {}
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setIsSavedInVault(false);
    setCaliperMeasurements([]);

    try {
      // Step 1: Segmentation
      setAnalysisStep('Scanning 12-Lead layout, calibration pulse & baseline grid...');
      await new Promise((r) => setTimeout(r, 400));

      if (analysisMode === 'online_database' && isOnline) {
        setAnalysisStep('Querying real-time ESC/AHA guidelines & PubMed database...');

        const response = await fetch('/api/ecg/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            patientContext,
            mode: analysisMode,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Server analysis request failed. Falling back to offline engine.');
        }

        const data = await response.json();
        const analysisResult: ECGAnalysis = {
          ...data.analysis,
          imageDataUrl,
          analysis_mode: 'online_database',
          timestamp: new Date().toISOString(),
          patientAge: patientContext.age || data.analysis.patientAge,
          patientSex: (patientContext.sex as any) || data.analysis.patientSex,
          clinicalSymptoms: patientContext.symptoms || data.analysis.clinicalSymptoms,
        };

        setCurrentAnalysis(analysisResult);
        await autoSaveAndAlert(analysisResult);
      } else {
        // Pure Offline Algorithmic Engine
        setAnalysisStep('Running offline computer vision & electrophysiology rule engine...');
        await new Promise((r) => setTimeout(r, 600));

        const img = new Image();
        img.src = imageDataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const offlineResult = await analyzeECGOffline(img, patientContext);
        offlineResult.imageDataUrl = imageDataUrl;

        setCurrentAnalysis(offlineResult);
        await autoSaveAndAlert(offlineResult);
      }
    } catch (err: any) {
      console.warn('Online analysis failed, falling back to client-side engine:', err);
      setErrorMessage(`Online medical query notice: ${err.message}. Running local offline engine instead.`);

      try {
        const img = new Image();
        img.src = imageDataUrl;
        await new Promise((resolve) => (img.onload = resolve));
        const fallbackResult = await analyzeECGOffline(img, patientContext);
        fallbackResult.imageDataUrl = imageDataUrl;
        setCurrentAnalysis(fallbackResult);
        await autoSaveAndAlert(fallbackResult);
      } catch (fallbackErr: any) {
        setErrorMessage('Failed to process ECG image. Please verify file format and resolution.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const autoSaveAndAlert = async (result: ECGAnalysis) => {
    // Check for critical alert and trigger push notification & audio alarm
    if (result.critical_alert) {
      const alertMsg = result.alert_reasons?.[0] || 'Urgent 12-Lead abnormality detected. Please review immediately.';
      sendIrregularityAlert('🚨 CardioPulse Critical Cardiac Alert', alertMsg, true);
    }

    // Auto-save into encrypted IndexedDB
    try {
      const recordId = await saveECGRecord(result, currentUser?.id || 'dr-hafizuddin-01');
      result.id = recordId;
      setIsSavedInVault(true);
      loadRecords();
    } catch (e) {
      console.warn('Could not auto-save record:', e);
    }
  };

  // Handle uploaded file
  const handleECGLoaded = (dataUrl: string, metadata: { age?: string; sex?: string; symptoms?: string }) => {
    setCurrentImage(dataUrl);
    runAnalysis(dataUrl, metadata);
  };

  // Handle sample preset selection
  const handleSelectSample = (sample: SampleECGCase, synthesizedDataUrl: string) => {
    setCurrentImage(synthesizedDataUrl);
    const enriched: ECGAnalysis = {
      ...sample.presetAnalysis,
      id: 'sample-' + sample.id + '-' + Date.now(),
      imageDataUrl: synthesizedDataUrl,
      timestamp: new Date().toISOString(),
    };
    setCurrentAnalysis(enriched);
    setCaliperMeasurements([]);
    autoSaveAndAlert(enriched);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this encrypted medical record?')) {
      await deleteECGRecord(id, currentUser?.id || 'dr-hafizuddin-01');
      loadRecords();
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null);
        setCurrentImage(null);
      }
    }
  };

  const handleSelectRecordFromDashboard = (record: ECGAnalysis) => {
    setCurrentAnalysis(record);
    if (record.imageDataUrl) {
      setCurrentImage(record.imageDataUrl);
    }
    setActiveTab('analysis');
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white ${
        isSeniorMode ? 'text-lg' : 'text-sm'
      }`}
    >
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode Active: All 12-lead readings, reports, and encrypted vaults operate seamlessly without internet.</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        isSeniorMode={isSeniorMode}
        setIsSeniorMode={setIsSeniorMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* TAB 1: 12-LEAD ECG ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* If no ECG loaded yet, show Upload Section */}
            {!currentImage && !isAnalyzing && (
              <UploadSection
                onECGLoaded={handleECGLoaded}
                onSelectSampleCase={handleSelectSample}
                analysisMode={analysisMode}
                setAnalysisMode={setAnalysisMode}
                isOnline={isOnline}
              />
            )}

            {/* Analyzing Progress State */}
            {isAnalyzing && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-6 shadow-2xl">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin" />
                  <Loader2 className="w-8 h-8 text-rose-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Analyzing 12-Lead Electrocardiogram</h3>
                  <p className="text-sm text-sky-400 font-mono mt-2 animate-pulse">{analysisStep}</p>
                </div>
                <div className="max-w-md mx-auto text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  Applying 4th Universal Definition STEMI criteria &amp; querying peer-reviewed cardiology references.
                </div>
              </div>
            )}

            {/* Error Notification if any */}
            {errorMessage && (
              <div className="bg-amber-950/80 border border-amber-500/70 p-4 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-amber-400 hover:text-white font-bold text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Loaded ECG & Results View */}
            {currentImage && !isAnalyzing && (
              <div className="space-y-6">
                {/* Back to Upload / Reset Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => {
                      setCurrentImage(null);
                      setCurrentAnalysis(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Upload New ECG</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Current Reading:</span>
                    <span className="font-bold text-white">
                      {currentAnalysis?.patientName || currentAnalysis?.patientAge
                        ? `Patient Age ${currentAnalysis.patientAge} (${currentAnalysis.patientSex})`
                        : '12-Lead Tracing'}
                    </span>
                    <button
                      onClick={() => runAnalysis(currentImage)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-medium transition"
                      title="Re-run analysis"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-Analyze</span>
                    </button>
                  </div>
                </div>

                {/* 12-Lead Interactive Canvas Viewer with Calipers & Redactor */}
                <ECGViewer
                  imageSrc={currentImage}
                  caliperMeasurements={caliperMeasurements}
                  onAddCaliperMeasurement={(m) => setCaliperMeasurements((prev) => [...prev, m])}
                  onRedactionApplied={(newSrc) => {
                    setCurrentImage(newSrc);
                    if (currentAnalysis) {
                      currentAnalysis.imageDataUrl = newSrc;
                    }
                  }}
                />

                {/* Senior Mode View vs Standard Clinical Report View */}
                {currentAnalysis && (
                  <>
                    {isSeniorMode ? (
                      <ElderlyView
                        analysis={currentAnalysis}
                        onShareReport={() => setShowExportModal(true)}
                      />
                    ) : (
                      <AnalysisResults
                        analysis={currentAnalysis}
                        onExportReport={() => setShowExportModal(true)}
                        onSaveToVault={() => currentAnalysis && autoSaveAndAlert(currentAnalysis)}
                        isSaved={isSavedInVault}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HEALTH TRENDS & ALERTS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <HealthTrendsDashboard
            records={records}
            onSelectRecord={handleSelectRecordFromDashboard}
            onDeleteRecord={handleDeleteRecord}
            onExportRecord={(rec) => {
              setCurrentAnalysis(rec);
              setShowExportModal(true);
            }}
          />
        )}

        {/* TAB 3: MEDICAL KNOWLEDGE DATABASE */}
        {activeTab === 'database' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <MedicalDatabaseModal onClose={() => setActiveTab('analysis')} />
          </div>
        )}

        {/* TAB 4: HIPAA AUDIT VAULT */}
        {activeTab === 'audit' && <HIPAAAuditVault />}
      </main>

      {/* Floating Modals */}
      {showAuthModal && (
        <BiometricAuthModal
          currentUser={currentUser}
          onSuccess={(u) => {
            setCurrentUser(u);
            setActiveUser(u);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showExportModal && currentAnalysis && (
        <ExportReportModal
          analysis={currentAnalysis}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>
          CardioPulse 12-Lead ECG Copilot &amp; Heart Health Monitor · Guideline-Driven Decision Support
        </p>
        <p className="text-[11px] text-slate-600">
          Operates online with real-time medical literature grounding and 100% offline via client-side algorithmic engine.
        </p>
      </footer>
    </div>
  );
}
