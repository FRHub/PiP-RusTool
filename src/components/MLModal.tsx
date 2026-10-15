import React from 'react';
import { mlService } from '../services/MachineLearningService';
import { Sparkles, Trash2, Database, X, CheckCircle2 } from 'lucide-react';
import { WindowData } from '../types';

interface MLModalProps {
  isOpen: boolean;
  onClose: () => void;
  langStrings: Record<string, string>;
  onDataChanged: () => void;
}

export const MLModal: React.FC<MLModalProps> = ({
  isOpen,
  onClose,
  langStrings,
  onDataChanged,
}) => {
  if (!isOpen) return null;

  const data = mlService.getData();

  const handleClear = () => {
    mlService.clearData();
    onDataChanged();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#252528] border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1f1f22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {langStrings.trainingData || 'Machine Learning Training Data'}
              </h2>
              <p className="text-xs text-neutral-400">
                Ported from PiP-Tool C# ML.NET Stochastic Dual Coordinate Ascent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info stats */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-neutral-800/60 border border-neutral-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-neutral-400 block mb-1">Total Training Records</span>
              <span className="text-xl font-bold text-white font-mono">{data.length}</span>
            </div>
            <div className="bg-neutral-800/60 border border-neutral-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-neutral-400 block mb-1">Engine Status</span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Active & Learning
              </span>
            </div>
            <div className="bg-neutral-800/60 border border-neutral-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-neutral-400 block mb-1">Model Persistence</span>
              <span className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 mt-1">
                <Database className="w-4 h-4" /> LocalStorage
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
            Every time you crop a window and enter PiP mode, PiP-Tool records the window title, application program, and crop coordinates. It updates the ML predictor so future windows automatically snap to your preferred bounding box!
          </p>
        </div>

        {/* Records list */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Recorded Dataset Entries (CSV Format)
          </h3>
          <div className="space-y-2">
            {data.map((item: WindowData, idx: number) => (
              <div
                key={idx}
                className="bg-[#1b1b1e] border border-neutral-800 rounded-lg p-3 text-xs font-mono flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[10px] font-bold">
                      {item.program}
                    </span>
                    <span className="text-neutral-200 font-sans font-medium">{item.windowTitle}</span>
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    Region: <span className="text-yellow-400">{item.region}</span> · Window:{' '}
                    {item.windowWidth}×{item.windowHeight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-[#1f1f22] flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{langStrings.clearMLData || 'Reset ML Data'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
