import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WindowInfo, Rect, RegionPrediction, Language } from './types';
import { PRESET_WINDOWS } from './data/mockWindows';
import { mlService } from './services/MachineLearningService';
import { getTranslation } from './utils/i18n';
import { MainWindowBar } from './components/MainWindowBar';
import { WindowContentView } from './components/WindowContentView';
import { CropperOverlay } from './components/CropperOverlay';
import { PiPFloatingWindow } from './components/PiPFloatingWindow';
import { ConfigModal } from './components/ConfigModal';
import { Sparkles, Play, X } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const t = getTranslation(lang);

  const [windows] = useState<WindowInfo[]>(PRESET_WINDOWS);
  // When launched, no window is selected yet — only the topbar is shown!
  const [selectedWindow, setSelectedWindow] = useState<WindowInfo | null>(null);

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
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Config modal
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Toast ref to prevent timer race conditions
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure stage dimensions using ResizeObserver
  useEffect(() => {
    const el = stageContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      setStageDimensions({
        width: el.clientWidth || 1280,
        height: el.clientHeight || 720,
      });
    };

    updateSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateSize);
      ro.observe(el);
    } else {
      window.addEventListener('resize', updateSize);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateSize);
    };
  }, [isCropping, selectedWindow]);

  // Window selection handler from topbar dropdown
  const handleSelectWindow = (win: WindowInfo) => {
    setSelectedWindow(win);
    setIsPipActive(false);
    setIsCropping(true);

    const pred = mlService.predict(win);
    setPrediction(pred);

    const safeW = win.width || 1280;
    const safeH = win.height || 720;
    const w = Math.min(safeW, Math.max(60, pred.width));
    const h = Math.min(safeH, Math.max(60, pred.height));
    const x = Math.max(0, Math.min(safeW - w, pred.left));
    const y = Math.max(0, Math.min(safeH - h, pred.top));

    setCropRect({ x, y, width: w, height: h });

    if (pred.tag.includes('Favorite')) {
      showToast(`⭐ Auto-applied favorite crop for ${win.program}!`);
    } else {
      showToast(`Selected [${win.executable}] · Adjust crop & press Enter to PiP`);
    }
  };

  // Apply predicted region manually
  const applyPrediction = useCallback(() => {
    if (!prediction || !selectedWindow) return;
    const safeW = selectedWindow.width || 1280;
    const safeH = selectedWindow.height || 720;
    const w = Math.min(safeW, Math.max(60, prediction.width));
    const h = Math.min(safeH, Math.max(60, prediction.height));
    const x = Math.max(0, Math.min(safeW - w, prediction.left));
    const y = Math.max(0, Math.min(safeH - h, prediction.top));

    setCropRect({ x, y, width: w, height: h });
    showToast(`${t.aiPrediction}: ${prediction.tag}`);
  }, [prediction, selectedWindow, t.aiPrediction]);

  // Launch PiP and train ML
  const startPipMode = () => {
    if (!selectedWindow) return;
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
    setIsCropping(false);
    setIsPipActive(true);
    showToast(t.newSampleRecorded || 'PiP Launched');
  };

  // Stop button handler (on topbar)
  const handleStop = () => {
    if (isPipActive) {
      setIsPipActive(false);
      showToast('PiP mode stopped');
    } else if (isCropping) {
      setIsCropping(false);
      setSelectedWindow(null);
    } else {
      showToast('PiP-Tool idle');
    }
  };

  // Toast notification
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3200);
  };

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Keyboard hotkeys matching PiP-Tool Windows App
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        if (isCropping && selectedWindow) {
          e.preventDefault();
          startPipMode();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isConfigOpen) {
          setIsConfigOpen(false);
        } else if (isPipActive) {
          setIsPipActive(false);
        } else if (isCropping) {
          setIsCropping(false);
          setSelectedWindow(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPipActive, isCropping, cropRect, selectedWindow, isConfigOpen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#0e1117]">
      {/* Realistic Windows 11 Desktop Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c24] via-[#12141a] to-[#090b10] pointer-events-none">
        {/* Subtle Windows desktop ambient light / grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-transparent to-transparent" />
      </div>

      {/* 
        Windows PiP-Tool Floating TopBar:
        Clean floating bar with ONLY:
        1. Drag button (Grip)
        2. Dropdown list of opened windows
        3. Config icon
        4. Stop icon
      */}
      <MainWindowBar
        windows={windows}
        selectedWindow={selectedWindow}
        onSelectWindow={handleSelectWindow}
        onOpenConfig={() => setIsConfigOpen(true)}
        onStop={handleStop}
        isPipActive={isPipActive}
        langStrings={t as any}
      />

      {/* When in cropping mode (after choosing window from dropdown) */}
      {isCropping && selectedWindow && (
        <div className="absolute inset-0 flex items-center justify-center p-6 z-20">
          <div
            ref={stageContainerRef}
            className="relative w-full max-w-5xl aspect-video max-h-[80vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-700/80 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Active Windows Process Canvas */}
            <WindowContentView
              windowInfo={selectedWindow}
              videoRef={sourceVideoRef}
              canvasRef={sourceCanvasRef}
            />

            {/* Cropper Overlay */}
            <CropperOverlay
              containerWidth={selectedWindow.width || stageDimensions.width}
              containerHeight={selectedWindow.height || stageDimensions.height}
              cropRect={cropRect}
              onChangeCropRect={setCropRect}
              prediction={prediction}
              onApplyPrediction={applyPrediction}
              langStrings={t as any}
            />

            {/* Floating Confirmation Actions Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-neutral-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-700 shadow-2xl text-xs">
              <span className="text-neutral-300 font-medium mr-1">
                Crop [{selectedWindow.executable}]:
              </span>
              <button
                onClick={startPipMode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch PiP [Enter]</span>
              </button>
              <button
                onClick={() => {
                  setIsCropping(false);
                  setSelectedWindow(null);
                }}
                className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Picture in Picture Window */}
      {isPipActive && selectedWindow && (
        <PiPFloatingWindow
          cropRect={cropRect}
          sourceCanvasRef={sourceCanvasRef}
          sourceVideoRef={sourceVideoRef}
          sourceWidth={selectedWindow.width || stageDimensions.width}
          sourceHeight={selectedWindow.height || stageDimensions.height}
          onClose={() => setIsPipActive(false)}
          onReCrop={() => setIsCropping(true)}
          onChangeWindow={() => {
            const nextIdx = (windows.indexOf(selectedWindow) + 1) % windows.length;
            handleSelectWindow(windows[nextIdx]);
          }}
          onResetCrop={() => {
            const safeW = selectedWindow.width || 1280;
            const safeH = selectedWindow.height || 720;
            setCropRect({ x: 0, y: 0, width: safeW, height: safeH });
            showToast('Crop reset to full window');
          }}
          program={selectedWindow.program}
          langStrings={t as any}
          title={selectedWindow.title}
          onNotify={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#252528]/95 backdrop-blur-md border border-neutral-700 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Windows Taskbar at bottom for authentic desktop feel */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-[#1e1e24]/90 backdrop-blur-md border-t border-neutral-800/80 flex items-center justify-between px-4 text-xs text-neutral-400 pointer-events-none select-none z-10">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white tracking-wider text-[11px]">Windows 11 Desktop</span>
          <span className="text-[10px] text-neutral-500">|</span>
          <span className="text-[11px] text-neutral-400">
            {selectedWindow ? `Active Window: [${selectedWindow.executable}]` : 'PiP-Tool Ready · Select an open window from topbar'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
          <span>DWM Compositor Active</span>
        </div>
      </div>

      {/* Configuration & Settings Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ru' : 'en'))}
        langStrings={t as any}
        onDataChanged={() => {}}
      />
    </div>
  );
};
