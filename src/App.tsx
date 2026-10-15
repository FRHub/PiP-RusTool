import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WindowInfo, Rect, RegionPrediction, Language } from './types';
import { PRESET_WINDOWS } from './data/mockWindows';
import { mlService } from './services/MachineLearningService';
import { getTranslation } from './utils/i18n';
import { MainWindowBar } from './components/MainWindowBar';
import { WindowContentView } from './components/WindowContentView';
import { CropperOverlay } from './components/CropperOverlay';
import { PiPFloatingWindow } from './components/PiPFloatingWindow';
import { MLModal } from './components/MLModal';
import { AboutModal } from './components/AboutModal';
import { YouTubeIssuesModal } from './components/YouTubeIssuesModal';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { YoutubeIcon } from './components/icons';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const t = getTranslation(lang);

  const [windows, setWindows] = useState<WindowInfo[]>(PRESET_WINDOWS);
  const [selectedWindow, setSelectedWindow] = useState<WindowInfo>(PRESET_WINDOWS[0]);

  // Video and canvas references
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  // Stage size
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });

  // Cropper state
  const [cropRect, setCropRect] = useState<Rect>({
    x: 80,
    y: 60,
    width: 800,
    height: 450,
  });
  const [prediction, setPrediction] = useState<RegionPrediction | null>(null);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [mlSamplesCount, setMlSamplesCount] = useState<number>(mlService.getData().length);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isMLModalOpen, setIsMLModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState<boolean>(false);
  const [isCodeExplorerOpen, setIsCodeExplorerOpen] = useState<boolean>(false);

  // Measure stage dimensions
  useEffect(() => {
    const updateSize = () => {
      if (stageContainerRef.current) {
        setStageDimensions({
          width: stageContainerRef.current.clientWidth || 1280,
          height: stageContainerRef.current.clientHeight || 720,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update ML prediction whenever selected window changes
  useEffect(() => {
    const pred = mlService.predict(selectedWindow);
    setPrediction(pred);

    setCropRect({
      x: pred.left,
      y: pred.top,
      width: pred.width,
      height: pred.height,
    });
  }, [selectedWindow]);

  // Apply predicted region manually
  const applyPrediction = useCallback(() => {
    if (!prediction) return;
    setCropRect({
      x: prediction.left,
      y: prediction.top,
      width: prediction.width,
      height: prediction.height,
    });
    showToast(`${t.aiPrediction}: ${prediction.tag} (${Math.round(prediction.confidence * 100)}%)`);
  }, [prediction, t.aiPrediction]);

  // Launch PiP and train ML
  const startPipMode = () => {
    const regionStr = `${cropRect.y} ${cropRect.x} ${cropRect.height} ${cropRect.width}`;
    mlService.addData(
      regionStr,
      selectedWindow.program,
      selectedWindow.title,
      0,
      0,
      selectedWindow.height,
      selectedWindow.width
    );
    setMlSamplesCount(mlService.getData().length);
    setIsPipActive(true);
    showToast(t.newSampleRecorded);
  };

  // Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Keyboard hotkeys matching PiP-Tool Windows App
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        startPipMode();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isPipActive) setIsPipActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPipActive, cropRect, selectedWindow]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#18181b] overflow-hidden select-none">
      {/* Windows Native MainWindow Controller Bar */}
      <MainWindowBar
        windows={windows}
        selectedWindow={selectedWindow}
        onSelectWindow={(win) => setSelectedWindow(win)}
        onStartPip={startPipMode}
        onQuit={() => setIsPipActive(false)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ru' : 'en'))}
        onOpenML={() => setIsMLModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenYouTubeIssues={() => setIsYouTubeModalOpen(true)}
        onOpenCodeExplorer={() => setIsCodeExplorerOpen(true)}
        langStrings={t as any}
        isPipActive={isPipActive}
        mlSamplesCount={mlSamplesCount}
      />

      {/* Main Workspace Stage - Represents the Windows Desktop Window Manager Stage */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-[#111113]">
        <div
          ref={stageContainerRef}
          className="relative w-full max-w-6xl aspect-video max-h-[82vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800"
        >
          {/* Active Windows Process Canvas */}
          <WindowContentView
            windowInfo={selectedWindow}
            videoRef={sourceVideoRef}
            canvasRef={sourceCanvasRef}
          />

          {/* Windows Cropper Overlay */}
          <CropperOverlay
            containerWidth={selectedWindow.width || stageDimensions.width}
            containerHeight={selectedWindow.height || stageDimensions.height}
            cropRect={cropRect}
            onChangeCropRect={setCropRect}
            prediction={prediction}
            onApplyPrediction={applyPrediction}
            langStrings={t as any}
          />
        </div>
      </div>

      {/* Floating Picture in Picture Window (Windows TopMost DWM Overlay) */}
      {isPipActive && (
        <PiPFloatingWindow
          cropRect={cropRect}
          sourceCanvasRef={sourceCanvasRef}
          sourceVideoRef={sourceVideoRef}
          sourceWidth={selectedWindow.width || stageDimensions.width}
          sourceHeight={selectedWindow.height || stageDimensions.height}
          onClose={() => setIsPipActive(false)}
          onReCrop={() => setIsPipActive(false)}
          onChangeWindow={() => {
            const nextIdx = (windows.indexOf(selectedWindow) + 1) % windows.length;
            setSelectedWindow(windows[nextIdx]);
          }}
          langStrings={t as any}
          title={selectedWindow.title}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#252528]/95 backdrop-blur-md border border-neutral-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Launch Bottom Bar Pill for Windows Community Issues & Native Engines */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#1f1f23]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-700 shadow-2xl text-xs">
        <button
          onClick={() => setIsYouTubeModalOpen(true)}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-red-400 font-medium px-2 py-0.5 rounded transition-colors"
        >
          <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
          <span>YouTube Windows Bugs Audit (6 Fixed)</span>
        </button>
        <div className="w-[1px] h-3.5 bg-neutral-700" />
        <button
          onClick={() => setIsCodeExplorerOpen(true)}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-orange-400 font-medium px-2 py-0.5 rounded transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Windows Rust & Zig Codebase</span>
        </button>
      </div>

      {/* ML Training Dataset Modal */}
      <MLModal
        isOpen={isMLModalOpen}
        onClose={() => setIsMLModalOpen(false)}
        langStrings={t as any}
        onDataChanged={() => setMlSamplesCount(mlService.getData().length)}
      />

      {/* About & Instructions Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        langStrings={t as any}
      />

      {/* YouTube Scraped Comments & Fixes Modal */}
      <YouTubeIssuesModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
      />

      {/* Rust & Zig Source Code Explorer Modal */}
      <CodeExplorerModal
        isOpen={isCodeExplorerOpen}
        onClose={() => setIsCodeExplorerOpen(false)}
      />
    </div>
  );
};
