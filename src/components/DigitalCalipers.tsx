/**
 * Digital ECG Calipers Tool
 * Precision measurement of intervals (ms), voltages (mV), and instantaneous heart rates (bpm)
 * Standard calibration: 25 mm/s (1mm = 40ms) and 10 mm/mV (1mm = 0.1mV)
 */
import React, { useState } from 'react';
import { CaliperMeasurement } from '../types/ecg';
import { Ruler, Check, X, RotateCcw } from 'lucide-react';

interface DigitalCalipersProps {
  canvasWidth: number;
  canvasHeight: number;
  onSaveMeasurement: (measurement: CaliperMeasurement) => void;
  onClose: () => void;
}

export const DigitalCalipers: React.FC<DigitalCalipersProps> = ({
  canvasWidth,
  canvasHeight,
  onSaveMeasurement,
  onClose,
}) => {
  // Point A and Point B on canvas
  const [p1, setP1] = useState<{ x: number; y: number }>({ x: 200, y: 300 });
  const [p2, setP2] = useState<{ x: number; y: number }>({ x: 320, y: 300 });
  const [activeHandle, setActiveHandle] = useState<'p1' | 'p2' | null>(null);
  const [label, setLabel] = useState('PR Interval');
  const [leadName, setLeadName] = useState('Lead II');

  // Calibration scale: Standard 1400px wide canvas represents approx 10s of ECG (250mm = 10000ms)
  // Therefore, 1px horizontal ≈ 7.14ms.
  // Standard vertical: 10mm = 1mV ≈ 60px. Therefore, 60px ≈ 1.0mV (1px ≈ 0.0167 mV).
  const msPerPx = 7.14;
  const mvPerPx = 0.0167;

  const deltaX = Math.abs(p2.x - p1.x);
  const deltaY = Math.abs(p2.y - p1.y);

  const measuredMs = Math.round(deltaX * msPerPx);
  const measuredMv = Number((deltaY * mvPerPx).toFixed(2));
  const calculatedBpm = measuredMs > 0 ? Math.round(60000 / measuredMs) : 0;

  const handlePointerDown = (handle: 'p1' | 'p2', e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveHandle(handle);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasWidth, (e.clientX - rect.left) * (canvasWidth / rect.width)));
    const y = Math.max(0, Math.min(canvasHeight, (e.clientY - rect.top) * (canvasHeight / rect.height)));

    if (activeHandle === 'p1') {
      setP1({ x, y });
    } else {
      setP2({ x, y });
    }
  };

  const handlePointerUp = () => {
    setActiveHandle(null);
  };

  const handleSave = () => {
    const measurement: CaliperMeasurement = {
      id: 'caliper-' + Date.now(),
      label,
      leadName,
      deltaX_px: deltaX,
      deltaY_px: deltaY,
      time_ms: measuredMs,
      voltage_mv: measuredMv,
      calculatedBpm: calculatedBpm > 20 && calculatedBpm < 300 ? calculatedBpm : undefined,
      timestamp: new Date().toLocaleTimeString(),
    };
    onSaveMeasurement(measurement);
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none">
      {/* Interactive Dragging Layer */}
      <div
        className="w-full h-full pointer-events-auto cursor-crosshair relative"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* SVG Caliper Lines */}
        <svg className="w-full h-full absolute inset-0" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
          <defs>
            <filter id="caliperGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Vertical Guides for Point 1 */}
          <line
            x1={p1.x}
            y1={0}
            x2={p1.x}
            y2={canvasHeight}
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          {/* Vertical Guides for Point 2 */}
          <line
            x1={p2.x}
            y1={0}
            x2={p2.x}
            y2={canvasHeight}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Measurement Span Line */}
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p1.y}
            stroke="#38bdf8"
            strokeWidth="2.5"
            filter="url(#caliperGlow)"
          />

          {/* Caliper Tips */}
          <circle
            cx={p1.x}
            cy={p1.y}
            r="9"
            fill="#06b6d4"
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-ew-resize hover:scale-125 transition-transform"
            onPointerDown={(e) => handlePointerDown('p1', e)}
          />
          <circle
            cx={p2.x}
            cy={p2.y}
            r="9"
            fill="#f43f5e"
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-ew-resize hover:scale-125 transition-transform"
            onPointerDown={(e) => handlePointerDown('p2', e)}
          />
        </svg>

        {/* Floating Measurement HUD */}
        <div
          className="absolute z-40 bg-slate-900/95 border border-sky-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md text-white text-xs space-y-2 pointer-events-auto"
          style={{
            left: `${Math.min(canvasWidth - 280, Math.max(20, (p1.x + p2.x) / 2 - 140))}px`,
            top: `${Math.min(canvasHeight - 160, Math.max(20, Math.min(p1.y, p2.y) - 140))}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1.5">
            <span className="font-bold flex items-center gap-1.5 text-sky-400">
              <Ruler className="w-4 h-4 text-sky-400" />
              Digital Caliper
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Duration</div>
              <div className="text-sm font-black text-sky-300 font-mono">{measuredMs} ms</div>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Amplitude</div>
              <div className="text-sm font-black text-rose-300 font-mono">{measuredMv} mV</div>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Rate Equivalent</div>
              <div className="text-sm font-black text-emerald-300 font-mono">
                {calculatedBpm > 0 ? `${calculatedBpm} bpm` : '--'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none"
            >
              <option value="PR Interval">PR Interval (120-200ms)</option>
              <option value="QRS Duration">QRS Duration (&lt;120ms)</option>
              <option value="QT Interval">QT Interval</option>
              <option value="ST Elevation">ST Elevation (mV)</option>
              <option value="RR Interval">R-R Interval (Rate)</option>
              <option value="P Wave Duration">P Wave Duration</option>
            </select>

            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded text-xs flex items-center justify-center gap-1 shadow transition"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
