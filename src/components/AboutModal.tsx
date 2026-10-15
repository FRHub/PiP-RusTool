import React from 'react';
import { X, Info, Monitor, Cpu, CheckCircle, Terminal } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  langStrings: Record<string, string>;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  langStrings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#252528] border border-neutral-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1f1f22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {langStrings.about || 'About PiP-Tool Windows Native'}
              </h2>
              <p className="text-xs text-neutral-400">Microsoft Windows 10/11 DWM Compositor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-neutral-300 leading-relaxed">
          <p>{langStrings.aboutDesc}</p>

          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-2">
            <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-blue-400" />
              {langStrings.instructionsHeading}
            </h3>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{langStrings.instructionsStep1}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{langStrings.instructionsStep2}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{langStrings.instructionsStep3}</span>
            </p>
          </div>

          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Windows Native Toolchains</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-black/40 p-2 rounded border border-neutral-800">
                <span className="text-orange-400 font-bold block">Rust Engine:</span>
                <span className="text-neutral-400">cargo build --release</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-neutral-800">
                <span className="text-amber-400 font-bold block">Zig Engine:</span>
                <span className="text-neutral-400">zig build -Dtarget=x86_64-windows</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-3">
            {langStrings.keyboardHelp}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-[#1f1f22] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
