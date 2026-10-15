import React from 'react';
import { WindowInfo, Language } from '../types';
import {
  GripVertical,
  ChevronDown,
  Monitor,
  Sparkles,
  Power,
  Languages,
  HelpCircle,
  Tv,
  Code2,
} from 'lucide-react';
import { YoutubeIcon } from './icons';

interface MainWindowBarProps {
  windows: WindowInfo[];
  selectedWindow: WindowInfo;
  onSelectWindow: (win: WindowInfo) => void;
  onStartPip: () => void;
  onQuit: () => void;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenML: () => void;
  onOpenAbout: () => void;
  onOpenYouTubeIssues: () => void;
  onOpenCodeExplorer: () => void;
  langStrings: Record<string, string>;
  isPipActive: boolean;
  mlSamplesCount: number;
}

export const MainWindowBar: React.FC<MainWindowBarProps> = ({
  windows,
  selectedWindow,
  onSelectWindow,
  onStartPip,
  onQuit,
  isScreenSharing,
  onToggleScreenShare,
  lang,
  onToggleLang,
  onOpenML,
  onOpenAbout,
  onOpenYouTubeIssues,
  onOpenCodeExplorer,
  langStrings,
  isPipActive,
  mlSamplesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#2D2D30]/95 backdrop-blur-md border-b border-[#3e3e42] shadow-xl text-white">
      <div className="max-w-7xl mx-auto px-4 h-[56px] flex items-center justify-between gap-3">
        {/* Left Side: Drag Grip & App Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white cursor-grab transition-colors"
            title={langStrings.dragThisWindow || 'PiP-Tool'}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-sm">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block">
              <span className="font-semibold text-sm tracking-tight text-white block leading-none">
                {langStrings.appTitle}
              </span>
              <span className="text-[10px] text-neutral-400 tracking-wider">
                RUST & ZIG POWERED
              </span>
            </div>
          </div>
        </div>

        {/* Center: Window Selector Dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <select
              value={selectedWindow.id}
              onChange={(e) => {
                const found = windows.find((w) => w.id === e.target.value);
                if (found) onSelectWindow(found);
              }}
              title={langStrings.selectWindow}
              className="w-full bg-[#1e1e20] text-neutral-200 text-xs sm:text-sm pl-3 pr-8 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-blue-500 appearance-none font-medium truncate cursor-pointer shadow-inner"
            >
              {windows.map((win) => (
                <option key={win.id} value={win.id}>
                  {win.type === 'screen_share' ? '🖥️ ' : '🪟 '}
                  {win.title} ({win.program})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Real Screen/Window Capture Toggle */}
          <button
            onClick={onToggleScreenShare}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 border ${
              isScreenSharing
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700 hover:text-white'
            }`}
            title={isScreenSharing ? langStrings.stopScreenShare : langStrings.startScreenShare}
          >
            <Monitor className={`w-3.5 h-3.5 ${isScreenSharing ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span className="hidden md:inline">
              {isScreenSharing ? langStrings.stopScreenShare : langStrings.startScreenShare}
            </span>
          </button>
        </div>

        {/* Right Side: Tools & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* YouTube Video Issues & Fixes Button */}
          <button
            onClick={onOpenYouTubeIssues}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-700/50 text-red-300 text-xs hover:bg-red-900/50 transition-colors shadow-sm"
            title="Scraped YouTube Video Comments & Fixed Issues"
          >
            <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline font-semibold">YT Fixes (6)</span>
          </button>

          {/* Rust & Zig Native Codebase Explorer */}
          <button
            onClick={onOpenCodeExplorer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-950/40 border border-orange-700/50 text-orange-300 text-xs hover:bg-orange-900/50 transition-colors shadow-sm"
            title="View Rust & Zig Native Source Code"
          >
            <Code2 className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline font-semibold">Rust & Zig</span>
          </button>

          {/* ML Status Badge */}
          <button
            onClick={onOpenML}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-700/40 text-indigo-300 text-xs hover:bg-indigo-900/50 transition-colors"
            title={`${langStrings.aiModelTrained} (${mlSamplesCount} ${langStrings.recordsCount})`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline font-mono">{mlSamplesCount} ML</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold border border-neutral-700 transition-colors flex items-center gap-1"
            title="Switch Language / Сменить язык"
          >
            <Languages className="w-3.5 h-3.5 text-neutral-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* About / Help */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={langStrings.about}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Enter PiP Mode Button */}
          <button
            onClick={onStartPip}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              isPipActive
                ? 'bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
            }`}
            title={langStrings.enterPiPMode}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="font-medium">{langStrings.enterPiPMode}</span>
          </button>

          {/* Quit Button */}
          <button
            onClick={onQuit}
            className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title={langStrings.quit}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
