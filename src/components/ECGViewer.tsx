/**
 * Interactive 12-Lead ECG Canvas Viewer with Pan/Zoom, Calipers, and HIPAA Redactor
 */
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Ruler, Shield, Maximize2, Minimize2, Grid } from 'lucide-react';
import { DigitalCalipers } from './DigitalCalipers';
import { CaliperMeasurement } from '../types/ecg';

interface ECGViewerProps {
  imageSrc: string;
  caliperMeasurements?: CaliperMeasurement[];
  onAddCaliperMeasurement?: (m: CaliperMeasurement) => void;
  onRedactionApplied?: (newImageSrc: string) => void;
}

export const ECGViewer: React.FC<ECGViewerProps> = ({
  imageSrc,
  caliperMeasurements = [],
  onAddCaliperMeasurement,
  onRedactionApplied,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [calipersActive, setCalipersActive] = useState(false);
  const [redactMode, setRedactMode] = useState(false);
  const [redactStart, setRedactStart] = useState<{ x: number; y: number } | null>(null);
  const [redactRect, setRedactRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showLeadLabels, setShowLeadLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load and render image to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle Redaction Mouse Events
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (!redactMode) {
      if (e.button === 0 && !calipersActive) {
        setIsPanning(true);
        setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setRedactStart({ x, y });
    setRedactRect({ x, y, w: 0, h: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isPanning) {
      setPosition({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
      return;
    }

    if (!redactMode || !redactStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const currentY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const x = Math.min(redactStart.x, currentX);
    const y = Math.min(redactStart.y, currentY);
    const w = Math.abs(currentX - redactStart.x);
    const h = Math.abs(currentY - redactStart.y);

    setRedactRect({ x, y, w, h });
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (redactMode && redactRect && redactRect.w > 10 && redactRect.h > 10) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(redactRect.x, redactRect.y, redactRect.w, redactRect.h);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(redactRect.x, redactRect.y, redactRect.w, redactRect.h);
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('[HIPAA PHI REDACTED]', redactRect.x + redactRect.w / 2, redactRect.y + redactRect.h / 2);

          const updatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          if (onRedactionApplied) {
            onRedactionApplied(updatedDataUrl);
          }
        }
      }
    }
    setRedactStart(null);
    setRedactRect(null);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <span className="text-xs font-mono text-slate-400 px-1">{Math.round(scale * 100)}%</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Calipers Button */}
          <button
            onClick={() => {
              setCalipersActive(!calipersActive);
              if (redactMode) setRedactMode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shadow-md transition backdrop-blur-md ${
              calipersActive
                ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                : 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-sky-400" />
            <span>Digital Calipers</span>
          </button>

          {/* HIPAA Redact Tool */}
          <button
            onClick={() => {
              setRedactMode(!redactMode);
              if (calipersActive) setCalipersActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shadow-md transition backdrop-blur-md ${
              redactMode
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800'
            }`}
            title="Click and drag to redact patient names or identifiers"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Redact PHI</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 rounded-xl shadow-md transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Redaction Instruction Toast */}
      {redactMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-rose-950/90 border border-rose-500/80 px-4 py-2 rounded-xl text-xs text-rose-200 shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Shield className="w-4 h-4 text-rose-400" />
          Click and drag a box over any patient name or hospital MRN to redact it permanently.
        </div>
      )}

      {/* Canvas Viewport */}
      <div
        className="w-full h-[520px] sm:h-[620px] overflow-hidden flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        <div
          className="relative transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="max-w-none shadow-2xl rounded-lg border border-slate-700"
          />

          {/* Redaction Preview Box */}
          {redactRect && (
            <div
              className="absolute border-2 border-rose-500 bg-rose-500/30 pointer-events-none"
              style={{
                left: `${redactRect.x}px`,
                top: `${redactRect.y}px`,
                width: `${redactRect.w}px`,
                height: `${redactRect.h}px`,
              }}
            />
          )}

          {/* Calipers Interactive Overlay */}
          {calipersActive && canvasRef.current && (
            <DigitalCalipers
              canvasWidth={canvasRef.current.width}
              canvasHeight={canvasRef.current.height}
              onSaveMeasurement={(m) => {
                if (onAddCaliperMeasurement) onAddCaliperMeasurement(m);
              }}
              onClose={() => setCalipersActive(false)}
            />
          )}
        </div>
      </div>

      {/* Bottom Information Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Standard 12-Lead Format
          </span>
          <span>Speed: 25 mm/s</span>
          <span>Voltage: 10 mm/mV (1mV = 10mm)</span>
        </div>

        {caliperMeasurements.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Saved Caliper Points:</span>
            {caliperMeasurements.slice(-3).map((cm) => (
              <span
                key={cm.id}
                className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-sky-300 border border-slate-700"
              >
                {cm.label}: {cm.time_ms}ms ({cm.voltage_mv}mV)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
