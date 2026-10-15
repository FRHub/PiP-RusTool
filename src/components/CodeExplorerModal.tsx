import React, { useState } from 'react';
import { RUST_FILES, ZIG_FILES, CodeFile } from '../data/nativeSourceCode';
import { X, Copy, Check, Code, ShieldCheck, Zap, FileCode } from 'lucide-react';

interface CodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rust' | 'zig' | 'comparison'>('rust');
  const [selectedFile, setSelectedFile] = useState<CodeFile>(RUST_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const files = activeTab === 'rust' ? RUST_FILES : ZIG_FILES;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#1e1e22] border border-neutral-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[88vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Rust & Zig Native Source Codebase
              </h2>
              <p className="text-xs text-neutral-400">
                Migrated from legacy C# / WPF (.NET Framework 4.7)
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                setActiveTab('rust');
                setSelectedFile(RUST_FILES[0]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'rust'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rust Engine</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('zig');
                setSelectedFile(ZIG_FILES[0]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'zig'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Zig Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Architecture Comparison
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'comparison' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#161618]">
            <div className="max-w-3xl mx-auto space-y-4">
              <h3 className="text-base font-bold text-white">
                Technical Benchmark & Architecture Breakdown: C# vs. Rust vs. Zig
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                PiP-Tool originally suffered from WPF compositor overhead, garbage collection micro-stalls during 60 FPS video capture, and fragile Win32 P/Invoke calls. Here is how the native Rust and Zig architectures fundamentally eliminate those bottlenecks.
              </p>

              <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/60 shadow-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1f1f23] text-neutral-200 border-b border-neutral-700 font-semibold">
                    <tr>
                      <th className="p-3.5">Metric / Feature</th>
                      <th className="p-3.5 text-neutral-400">Legacy C# / WPF</th>
                      <th className="p-3.5 text-orange-400">Rust Migration</th>
                      <th className="p-3.5 text-amber-400">Zig Migration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    <tr>
                      <td className="p-3.5 font-medium text-white">Memory Management</td>
                      <td className="p-3.5 text-red-300">GC pauses (~15-40ms)</td>
                      <td className="p-3.5 text-emerald-400">Compile-time RAII (0 pauses)</td>
                      <td className="p-3.5 text-emerald-400">Explicit GPA allocator (0 pauses)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Multi-Monitor DPI Transitions</td>
                      <td className="p-3.5 text-red-300">Crash in DpiHelper (YouTube Bug)</td>
                      <td className="p-3.5 text-emerald-400">Safe rational scaling & clamp</td>
                      <td className="p-3.5 text-emerald-400">Safe clamp & zero-check scale</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Ghost / Click-Through Mode</td>
                      <td className="p-3.5 text-red-300">None (aiming blocked in FPS)</td>
                      <td className="p-3.5 text-emerald-400">WS_EX_TRANSPARENT toggle</td>
                      <td className="p-3.5 text-emerald-400">NativePipController.setClickThrough</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Background Capture Stalling</td>
                      <td className="p-3.5 text-red-300">Freezes when minimized</td>
                      <td className="p-3.5 text-emerald-400">Decoupled 60fps thread loop</td>
                      <td className="p-3.5 text-emerald-400">Retained frame buffer</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Binary Footprint</td>
                      <td className="p-3.5 text-neutral-400">~45 MB + .NET Runtime</td>
                      <td className="p-3.5 text-emerald-400">~6.8 MB (standalone)</td>
                      <td className="p-3.5 text-emerald-400">~2.1 MB (zero dependencies)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* File List Sidebar */}
            <div className="col-span-3 border-r border-neutral-800 bg-[#161618] p-3 overflow-y-auto space-y-1.5">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block px-2 mb-2">
                Project Files
              </span>
              {files.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                      isSelected
                        ? activeTab === 'rust'
                          ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40'
                          : 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Viewer */}
            <div className="col-span-9 flex flex-col bg-[#121214] overflow-hidden">
              {/* File header bar */}
              <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between bg-[#19191d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      /{selectedFile.path}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                      {selectedFile.language.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {selectedFile.description}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code text */}
              <div className="flex-1 overflow-auto p-5 font-mono text-xs leading-relaxed text-neutral-200 selection:bg-blue-600">
                <pre className="whitespace-pre">{selectedFile.content}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
