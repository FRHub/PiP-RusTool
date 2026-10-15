import React, { useState } from 'react';
import {
  SCRAPED_YOUTUBE_ISSUES,
  YOUTUBE_VIDEO_METADATA,
  YouTubeCommentIssue,
} from '../data/youtubeFeedback';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Bug,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { YoutubeIcon } from './icons';

interface YouTubeIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YouTubeIssuesModal: React.FC<YouTubeIssuesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<YouTubeCommentIssue>(
    SCRAPED_YOUTUBE_ISSUES[0]
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#212124] border border-neutral-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#19191b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <YoutubeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Scraped YouTube Community Errors & Solutions
                </h2>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  All 6 Fixed in Rust, Zig & Web
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Source: {YOUTUBE_VIDEO_METADATA.title} ({YOUTUBE_VIDEO_METADATA.url})
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

        {/* Content Body: Left Column (Issues List) & Right Column (Detail & Solved Implementation) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-800">
          {/* Left Column: Comment List */}
          <div className="md:col-span-5 overflow-y-auto p-4 space-y-2 bg-[#1b1b1e]">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
              User-Reported Problems ({SCRAPED_YOUTUBE_ISSUES.length})
            </div>
            {SCRAPED_YOUTUBE_ISSUES.map((issue) => {
              const isSelected = selectedIssue.id === issue.id;
              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-800/90 border-blue-500/60 shadow-md'
                      : 'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-blue-300">
                      {issue.author}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        issue.severity === 'Critical Crash'
                          ? 'bg-red-950 text-red-300 border border-red-800/60'
                          : issue.severity === 'High Bug'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 line-clamp-2 italic font-serif">
                    "{issue.comment}"
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{issue.problemCategory}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Resolution Analysis */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-4 bg-[#212124]">
            {/* Active Issue Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-blue-400">
                  {selectedIssue.author}
                </span>
                <span className="text-xs text-neutral-400">reported:</span>
              </div>
              <blockquote className="bg-neutral-900/80 border-l-4 border-amber-500 p-3 rounded-r-lg text-sm text-neutral-100 italic font-serif">
                "{selectedIssue.comment}"
              </blockquote>
            </div>

            {/* Problem Classification */}
            <div className="bg-[#19191b] p-3.5 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Underlying C# Root Cause
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {selectedIssue.solutionDescription}
              </p>
            </div>

            {/* Implementation fixes across Rust, Zig, and Web */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Verification & Architecture Fixes
              </span>

              {/* Rust implementation */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-orange-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Rust Engine Implementation
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 font-mono px-1.5 py-0.5 rounded">
                    Memory Safe
                  </span>
                </div>
                <p className="text-neutral-300 font-mono text-[11px] bg-black/40 p-1.5 rounded">
                  {selectedIssue.fixedInRust}
                </p>
              </div>

              {/* Zig implementation */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Zig Engine Implementation
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 font-mono px-1.5 py-0.5 rounded">
                    Zero Overhead
                  </span>
                </div>
                <p className="text-neutral-300 font-mono text-[11px] bg-black/40 p-1.5 rounded">
                  {selectedIssue.fixedInZig}
                </p>
              </div>

              {/* Web App implementation */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Web App Live Verification
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                    Interactive
                  </span>
                </div>
                <p className="text-neutral-300 font-mono text-[11px] bg-black/40 p-1.5 rounded">
                  {selectedIssue.fixedInWeb}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-[#19191b] flex items-center justify-between">
          <a
            href={YOUTUBE_VIDEO_METADATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
          >
            <YoutubeIcon className="w-4 h-4 text-red-500" />
            <span>Open video on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
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
