/**
 * Application Header Component
 * Brand identity, connectivity status, navigation tabs, senior mode toggle, and biometric profile badge
 */
import React from 'react';
import { PatientProfile } from '../types/ecg';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Heart,
  Activity,
  TrendingUp,
  Database,
  Shield,
  Wifi,
  WifiOff,
  UserCheck,
  Eye,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'analysis' | 'dashboard' | 'database' | 'audit';
  setActiveTab: (tab: 'analysis' | 'dashboard' | 'database' | 'audit') => void;
  isOnline: boolean;
  currentUser: PatientProfile | null;
  onOpenAuth: () => void;
  isSeniorMode: boolean;
  setIsSeniorMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  currentUser,
  onOpenAuth,
  isSeniorMode,
  setIsSeniorMode,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
                <Heart className="w-5 h-5 fill-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  CardioPulse <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/30">PRO</span>
                </h1>
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isOnline
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  }`}
                  title={isOnline ? 'Online: Medical databases active' : 'Offline: Local Algorithmic Mode active'}
                >
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isOnline ? 'Live Online' : 'Offline Vault'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">12-Lead ECG Copilot &amp; Long-Term Trend Monitor</p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <PWAInstallButton />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner max-w-full overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ECG Reader</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trends &amp; Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Medical Database</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>HIPAA Vault</span>
          </button>
        </nav>

        {/* Right Tools: Senior Mode Toggle, Biometric Auth Badge, PWA */}
        <div className="flex items-center gap-2.5">
          {/* Senior Accessibility Mode Toggle */}
          <button
            onClick={() => setIsSeniorMode(!isSeniorMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
              isSeniorMode
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-extrabold'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle Senior Patient Accessibility Mode (Large fonts & simple explanations)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isSeniorMode ? 'Senior Mode: ON' : 'Senior Mode'}</span>
          </button>

          {/* Biometric User Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 shadow transition"
          >
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold truncate max-w-[110px] hidden sm:inline">
              {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          <div className="hidden md:block">
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </header>
  );
};
