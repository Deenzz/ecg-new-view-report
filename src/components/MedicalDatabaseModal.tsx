/**
 * Real-Time Medical ECG Database & Clinical Guidelines Reference Modal
 * Queries ESC, ACC/AHA, PubMed, and PhysioNet PTB-XL standardized clinical benchmarks
 */
import React, { useState, useEffect } from 'react';
import { Database, Search, ExternalLink, X, BookOpen, ShieldAlert } from 'lucide-react';

interface Guideline {
  topic: string;
  organization: string;
  citation: string;
  url: string;
  keyRules: string[];
}

interface MedicalDatabaseModalProps {
  onClose: () => void;
}

export const MedicalDatabaseModal: React.FC<MedicalDatabaseModalProps> = ({ onClose }) => {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ecg/reference-database')
      .then((res) => res.json())
      .then((data) => {
        if (data.databases) {
          setGuidelines(data.databases);
        }
      })
      .catch((err) => console.warn('Could not load guideline database:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = guidelines.filter(
    (g) =>
      g.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.keyRules.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Global ECG Medical Knowledge Database</h3>
              <p className="text-xs text-slate-400">
                Grounded in Real-Time Clinical Literature, ESC/AHA Guidelines &amp; PhysioNet
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guidelines (e.g., STEMI, Wellens, PE S1Q3T3, Brugada, Hyperkalemia)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Guidelines List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Connecting to real-time medical database...
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                      {item.organization}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{item.topic}</h4>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 shrink-0 font-medium bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                  >
                    <span>View Study / DOI</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-xs text-slate-400 font-mono italic">{item.citation}</div>

                <div className="border-t border-slate-900 pt-2 space-y-1">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Diagnostic Criteria Rules:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {item.keyRules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No medical guidelines matched your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
