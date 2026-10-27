/**
 * Senior & Elderly Patient Accessibility Mode
 * Extra-large high-contrast typography, plain-English medical translation, and audio voice readout
 */
import React, { useState } from 'react';
import { ECGAnalysis } from '../types/ecg';
import { Heart, Volume2, VolumeX, CheckCircle, AlertCircle, Share2, PhoneCall } from 'lucide-react';

interface ElderlyViewProps {
  analysis: ECGAnalysis;
  onShareReport: () => void;
}

export const ElderlyView: React.FC<ElderlyViewProps> = ({ analysis, onShareReport }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const simpleText = `Hello. Here is the summary of your heart check. Your heart rate is ${analysis.heart_rate_bpm} beats per minute. ${analysis.layman_explanation || analysis.primary_synthesis} ${analysis.critical_alert ? 'Please contact your doctor or emergency medical service right away.' : 'Everything looks stable.'}`;

    const utterance = new SpeechSynthesisUtterance(simpleText);
    utterance.rate = 0.85; // Slower, clearer speech pace for elderly listeners
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const isEmergency = analysis.critical_alert;

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
      {/* Elderly Mode Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="inline-block bg-sky-500/20 text-sky-300 font-bold px-3 py-1 rounded-full text-sm mb-2 border border-sky-400/30">
            Senior Friendly Mode (Easy Read)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            Your Heart Health Summary
          </h2>
        </div>

        {/* Read Aloud Button */}
        <button
          onClick={toggleVoice}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-lg font-bold shadow-xl transition-all ${
            isSpeaking
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          <span>{isSpeaking ? 'Pause Audio' : 'Listen Out Loud'}</span>
        </button>
      </div>

      {/* Main Status Badge */}
      <div
        className={`p-6 rounded-3xl border-2 flex items-center gap-4 ${
          isEmergency
            ? 'bg-rose-950 border-rose-500 text-white'
            : 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
        }`}
      >
        {isEmergency ? (
          <AlertCircle className="w-12 h-12 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle className="w-12 h-12 text-emerald-400 shrink-0" />
        )}
        <div>
          <div className="text-xl sm:text-2xl font-black">
            {isEmergency
              ? 'Important: Please Contact a Doctor Right Now'
              : 'Your Heart Signals Look Stable & Healthy'}
          </div>
          <div className="text-base text-slate-300 mt-1">
            {isEmergency
              ? 'This recording showed unusual changes that need prompt medical review.'
              : 'No signs of a heart blockage or acute danger were found on this test.'}
          </div>
        </div>
      </div>

      {/* 3 Simple Question Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pulse / Heart Rate */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">
            1. How fast is my heart?
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-rose-400 font-mono">
              {analysis.heart_rate_bpm}
            </span>
            <span className="text-lg text-slate-300">beats / min</span>
          </div>
          <p className="text-sm text-slate-300 pt-2 border-t border-slate-800/80">
            {analysis.heart_rate_bpm >= 60 && analysis.heart_rate_bpm <= 100
              ? 'This is a normal resting heartbeat.'
              : analysis.heart_rate_bpm > 100
              ? 'Beating a bit faster than normal resting rate.'
              : 'Beating slower than normal resting rate.'}
          </p>
        </div>

        {/* Rhythm Regularity */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">
            2. Is the rhythm steady?
          </div>
          <div className="text-xl font-bold text-sky-300">
            {analysis.rate_rhythm.includes('Normal')
              ? 'Steady & Regular'
              : 'Needs Medical Check'}
          </div>
          <p className="text-sm text-slate-300 pt-2 border-t border-slate-800/80">
            {analysis.rate_rhythm}
          </p>
        </div>

        {/* Urgency */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">
            3. What should I do?
          </div>
          <div className="text-xl font-bold text-amber-300">
            {isEmergency ? 'Call Doctor / Hospital' : 'Show at Next Visit'}
          </div>
          <p className="text-sm text-slate-300 pt-2 border-t border-slate-800/80">
            {isEmergency
              ? 'Share this report with emergency medical staff immediately.'
              : 'Keep this report saved on your device for your regular doctor checkup.'}
          </p>
        </div>
      </div>

      {/* Plain Language Explanation */}
      <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-lg font-bold text-slate-200">
          In Plain English (What this test means for you):
        </h3>
        <p className="text-base text-slate-200 leading-relaxed">
          {analysis.layman_explanation || analysis.primary_synthesis}
        </p>
      </div>

      {/* Share / Consult Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <button
          onClick={onShareReport}
          className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition"
        >
          <Share2 className="w-5 h-5" />
          <span>Save &amp; Share with My Doctor</span>
        </button>

        {isEmergency && (
          <a
            href="tel:911"
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white text-lg font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call Emergency Services</span>
          </a>
        )}
      </div>
    </div>
  );
};
