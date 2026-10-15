import React, { useState } from 'react';
import { Language, WindowData } from '../types';
import { mlService } from '../services/MachineLearningService';
import {
  X,
  Settings,
  Languages,
  Sparkles,
  Trash2,
  Check,
  Star,
  Info,
  Monitor,
} from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang: () => void;
  langStrings: Record<string, string>;
  onDataChanged: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  langStrings,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ml' | 'about'>('general');
  const [data, setData] = useState<WindowData[]>(() => mlService.getData());

  if (!isOpen) return null;

  const handleClearData = () => {
    if (window.confirm('Reset all ML training data and favorite crops?')) {
      mlService.clearData();
      setData(mlService.getData());
      onDataChanged();
    }
  };

  const handleRemoveFavorite = (program: string) => {
    const item = data.find((d) => d.isFavorite && d.program === program);
    if (item) {
      const parts = item.region.split(' ').map(Number);
      mlService.toggleFavorite(
        item.program,
        item.windowTitle,
        { x: parts[1] || 0, y: parts[0] || 0, width: parts[3] || 100, height: parts[2] || 100 },
        item.windowWidth,
        item.windowHeight
      );
      setData(mlService.getData());
      onDataChanged();
    }
  };

  const favorites = data.filter((d) => d.isFavorite);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div className="bg-[#212124] border border-neutral-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#19191c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                PiP-Tool Windows Settings & Configuration
              </h2>
              <p className="text-xs text-neutral-400">Desktop Window Manager & ML Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-neutral-800 bg-[#1b1b1e]">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>General</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('ml');
              setData(mlService.getData());
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'ml'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span>Favorite Crops & ML ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Language Selection */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block text-sm">Interface Language</span>
                  <span className="text-neutral-400 text-xs">
                    Choose between English and Russian (Русский язык)
                  </span>
                </div>
                <button
                  onClick={onToggleLang}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <Languages className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'en' ? 'English (EN)' : 'Русский (RU)'}</span>
                </button>
              </div>

              {/* Windows Integration Details */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-2">
                <span className="font-semibold text-white block text-sm">Windows Compositor Modes</span>
                <div className="space-y-1.5 text-neutral-300 text-xs">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>DWM Thumbnail API (<code className="text-sky-300">dwmapi.dll</code>)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ghost Click-Through Mode (<code className="text-sky-300">WS_EX_TRANSPARENT</code>)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>PerMonitorV2 DPI Awareness (Zero multi-monitor crashes)</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ml' && (
            <div className="space-y-3">
              <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-yellow-400" />
                </div>
                <div>
                  <span className="font-semibold text-white block text-xs">Favorite Auto-Crops</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                    Clicking the Star ⭐ icon on the PiP window saves that exact crop as your permanent favorite for the application. Next time you select that app, PiP-Tool auto-applies your crop instantly!
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Saved App Favorites ({favorites.length})
                </span>
                {favorites.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 bg-neutral-900/40 rounded-xl border border-neutral-800/80">
                    No favorite crops saved yet. Click the Star ⭐ on any PiP window to favorite it!
                  </div>
                ) : (
                  favorites.map((fav, i) => (
                    <div
                      key={i}
                      className="bg-neutral-900 border border-yellow-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-white">{fav.program}</span>
                          <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-xs">
                            Region: {fav.region}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(fav.program)}
                        className="px-2 py-1 rounded bg-red-950 text-red-300 hover:bg-red-900/60 text-[10px] font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-neutral-800">
                <span className="text-neutral-400 text-[11px]">{data.length} total ML training samples</span>
                <button
                  onClick={handleClearData}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All ML Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-xs text-neutral-300">
                {langStrings.aboutDesc ||
                  'Engineered strictly for Microsoft Windows (10/11) with native Desktop Window Manager (dwmapi.dll) thumbnails, User32 compositor hooks, and PerMonitorV2 HiDPI scaling.'}
              </p>

              <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-2">
                <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span>Windows PiP Workflow</span>
                </h4>
                <p className="text-[11px] text-neutral-300">
                  1. Launch app (compact topbar appears).
                </p>
                <p className="text-[11px] text-neutral-300">
                  2. Select any open Windows process from the dropdown list.
                </p>
                <p className="text-[11px] text-neutral-300">
                  3. Adjust crop box or click Enter to launch PiP.
                </p>
                <p className="text-[11px] text-neutral-300">
                  4. Use the Star ⭐ icon to save favorite crops, Resolution icon to resize, and Stop icon to quit.
                </p>
              </div>

              <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2 font-mono">
                {langStrings.keyboardHelp}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-[#19191c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
