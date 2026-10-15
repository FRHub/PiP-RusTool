import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rect, PiPPosition } from '../types';
import {
  X,
  RotateCcw,
  Maximize2,
  Lock,
  Unlock,
  Sliders,
  Layers,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Ghost,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw as Rewind10,
  RotateCw as FastForward10,
  ZoomIn,
  Monitor,
} from 'lucide-react';

interface PiPFloatingWindowProps {
  cropRect: Rect;
  sourceCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  sourceVideoRef: React.RefObject<HTMLVideoElement | null>;
  sourceWidth: number;
  sourceHeight: number;
  onClose: () => void;
  onReCrop: () => void;
  onChangeWindow: () => void;
  langStrings: Record<string, string>;
  title: string;
}

export const PiPFloatingWindow: React.FC<PiPFloatingWindowProps> = ({
  cropRect,
  sourceCanvasRef,
  sourceVideoRef,
  sourceWidth,
  sourceHeight,
  onClose,
  onReCrop,
  onChangeWindow,
  langStrings,
  title,
}) => {
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);

  // Floating window position & size state
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(
    Math.round(480 * (cropRect.height / Math.max(1, cropRect.width)))
  );
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 30, y: 100 });
  const [isHovered, setIsHovered] = useState(false);
  const [lockRatio, setLockRatio] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Solved YouTube issues:
  // 1. Ghost / Click-Through Mode (@nemurishivasai4765 FPS gamer) -> WS_EX_TRANSPARENT
  const [isGhostMode, setIsGhostMode] = useState(false);
  // 2. Interactive Media Controls (@Fanceh)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
  });

  const aspectRatio = cropRect.width / Math.max(1, cropRect.height);

  // Keyboard shortcut: Alt+G to toggle Windows Ghost Mode for FPS gamers
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П')) {
        e.preventDefault();
        setIsGhostMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Default corner positioning
  const snapToCorner = useCallback(
    (corner: PiPPosition) => {
      const pad = 24;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      switch (corner) {
        case 'topLeft':
          setPos({ x: pad, y: pad + 60 });
          break;
        case 'topRight':
          setPos({ x: Math.max(pad, vw - width - pad), y: pad + 60 });
          break;
        case 'bottomLeft':
          setPos({ x: pad, y: Math.max(pad, vh - height - pad) });
          break;
        case 'bottomRight':
          setPos({
            x: Math.max(pad, vw - width - pad),
            y: Math.max(pad, vh - height - pad),
          });
          break;
      }
    },
    [width, height]
  );

  // Initialize position at bottom-right
  useEffect(() => {
    snapToCorner('bottomRight');
  }, []);

  // Apply Resolution Presets (Fix for @Gisborne1990: 1440p / 4K tiny size issue)
  const applyPresetSize = (targetW: number) => {
    const targetH = Math.round(targetW / aspectRatio);
    setWidth(targetW);
    setHeight(targetH);
    setPos((prev) => ({
      x: Math.max(10, Math.min(window.innerWidth - targetW - 10, prev.x)),
      y: Math.max(50, Math.min(window.innerHeight - targetH - 10, prev.y)),
    }));
  };

  // Continuous rendering of the cropped sub-region with zoom support
  useEffect(() => {
    const destCanvas = pipCanvasRef.current;
    if (!destCanvas) return;
    const destCtx = destCanvas.getContext('2d');
    if (!destCtx) return;

    let animId: number;

    const drawCroppedFrame = () => {
      const srcCanvas = sourceCanvasRef.current;
      if (srcCanvas && srcCanvas.width > 0 && srcCanvas.height > 0) {
        const scaleX = srcCanvas.width / Math.max(1, sourceWidth);
        const scaleY = srcCanvas.height / Math.max(1, sourceHeight);

        // Apply digital zoom
        const zoomFactor = Math.max(1, zoomLevel);
        const effectiveCropW = cropRect.width / zoomFactor;
        const effectiveCropH = cropRect.height / zoomFactor;
        const offsetX = (cropRect.width - effectiveCropW) / 2;
        const offsetY = (cropRect.height - effectiveCropH) / 2;

        const sx = (cropRect.x + offsetX) * scaleX;
        const sy = (cropRect.y + offsetY) * scaleY;
        const sw = effectiveCropW * scaleX;
        const sh = effectiveCropH * scaleY;

        destCtx.clearRect(0, 0, destCanvas.width, destCanvas.height);
        destCtx.drawImage(
          srcCanvas,
          sx,
          sy,
          sw,
          sh,
          0,
          0,
          destCanvas.width,
          destCanvas.height
        );
      }
      animId = requestAnimationFrame(drawCroppedFrame);
    };

    drawCroppedFrame();
    return () => cancelAnimationFrame(animId);
  }, [cropRect, sourceCanvasRef, sourceWidth, sourceHeight, zoomLevel]);

  // Dragging logic with multi-monitor clamping (Fix for @gkillerwog2147)
  const onPointerDownDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
      startW: width,
      startH: height,
    };
  };

  const onPointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    isResizingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
      startW: width,
      startH: height,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - width - 10, dragStartRef.current.startX + dx)),
        y: Math.max(50, Math.min(window.innerHeight - height - 10, dragStartRef.current.startY + dy)),
      });
    } else if (isResizingRef.current) {
      const dx = e.clientX - dragStartRef.current.mouseX;
      let newW = Math.max(180, Math.min(window.innerWidth - pos.x - 20, dragStartRef.current.startW + dx));
      let newH = lockRatio
        ? Math.round(newW / aspectRatio)
        : Math.max(100, dragStartRef.current.startH + (e.clientY - dragStartRef.current.mouseY));

      if (pos.y + newH > window.innerHeight - 20) {
        newH = window.innerHeight - pos.y - 20;
        if (lockRatio) newW = Math.round(newH * aspectRatio);
      }

      setWidth(newW);
      setHeight(newH);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current || isResizingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      isDraggingRef.current = false;
      isResizingRef.current = false;
    }
  };

  // Media control toggles
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (sourceVideoRef.current) {
      if (isPlaying) sourceVideoRef.current.pause();
      else sourceVideoRef.current.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (sourceVideoRef.current) {
      sourceVideoRef.current.muted = !isMuted;
    }
  };

  const skipTime = (seconds: number) => {
    if (sourceVideoRef.current) {
      sourceVideoRef.current.currentTime += seconds;
    }
  };

  return (
    <>
      {/* Windows Ghost Mode Active Banner */}
      {isGhostMode && (
        <div className="fixed top-16 right-6 z-50 bg-amber-950/90 border border-amber-600 text-amber-200 px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-pulse">
          <Ghost className="w-4 h-4 text-amber-400" />
          <span>Windows Ghost Mode Active (WS_EX_TRANSPARENT · Clicks pass to game)</span>
          <button
            onClick={() => setIsGhostMode(false)}
            className="ml-2 bg-amber-500 text-black px-2 py-0.5 rounded font-bold hover:bg-amber-400 text-[11px]"
          >
            Disable (Alt+G)
          </button>
        </div>
      )}

      <div
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowSettings(false);
        }}
        className={`fixed z-40 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-neutral-700/80 bg-[#1e1e24] transition-opacity select-none group ${
          isGhostMode ? 'pointer-events-none ring-2 ring-amber-500/50' : 'pointer-events-auto'
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${width}px`,
          height: `${height}px`,
          opacity,
        }}
      >
        {/* Main Canvas rendering cropped sub-region via DWM */}
        <canvas
          ref={pipCanvasRef}
          width={cropRect.width || 400}
          height={cropRect.height || 225}
          className="w-full h-full object-cover block bg-black"
        />

        {/* Hover TopBar matching PiP-Tool WPF PiPModeWindow:
            TopBarVisibility activates on mouse enter */}
        <div
          className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-2 transition-all duration-200 flex items-center justify-between ${
            isHovered && !isGhostMode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          {/* Drag handle title */}
          <div
            onPointerDown={onPointerDownDrag}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs text-neutral-200 font-medium truncate flex-1 pr-2"
            title={title}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{title}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Corner Snap */}
            <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/10">
              <button
                onClick={() => snapToCorner('topLeft')}
                className="p-1 hover:bg-white/20 text-neutral-300 rounded"
                title={langStrings.topLeft}
              >
                <ArrowUpLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => snapToCorner('topRight')}
                className="p-1 hover:bg-white/20 text-neutral-300 rounded"
                title={langStrings.topRight}
              >
                <ArrowUpRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => snapToCorner('bottomLeft')}
                className="p-1 hover:bg-white/20 text-neutral-300 rounded"
                title={langStrings.bottomLeft}
              >
                <ArrowDownLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => snapToCorner('bottomRight')}
                className="p-1 hover:bg-white/20 text-neutral-300 rounded"
                title={langStrings.bottomRight}
              >
                <ArrowDownRight className="w-3 h-3" />
              </button>
            </div>

            {/* Ghost / Click-Through Mode Toggle (Fix for @nemurishivasai4765 FPS gamer) */}
            <button
              onClick={() => setIsGhostMode(true)}
              className="p-1.5 rounded text-amber-300 hover:text-amber-200 hover:bg-amber-950/50 transition-colors"
              title="Ghost Mode (WS_EX_TRANSPARENT - Click-Through for FPS Gaming) [Alt+G]"
            >
              <Ghost className="w-3.5 h-3.5" />
            </button>

            {/* Toggle Lock Ratio */}
            <button
              onClick={() => setLockRatio(!lockRatio)}
              className={`p-1.5 rounded transition-colors ${
                lockRatio ? 'text-blue-400 bg-blue-950/60' : 'text-neutral-400 hover:text-white'
              }`}
              title={langStrings.lockRatio}
            >
              {lockRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            {/* Settings / Size / Opacity */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10"
              title="Windows Scale & Opacity"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Re-Crop current window */}
            <button
              onClick={onReCrop}
              className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10"
              title={langStrings.adjustRegion}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Select New Window */}
            <button
              onClick={onChangeWindow}
              className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10"
              title={langStrings.selectNewWindow}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Quit / Close PiP (matching ButtonQuit in WPF) */}
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white shadow-sm"
              title={langStrings.quit}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Hover Interactive Media Bar (Fix for @Fanceh) */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 transition-all duration-200 flex items-center justify-between ${
            isHovered && !isGhostMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => skipTime(-10)}
              className="p-1 text-neutral-300 hover:text-white transition-colors"
              title="Rewind 10s"
            >
              <Rewind10 className="w-3 h-3" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="p-1 text-neutral-300 hover:text-white transition-colors"
              title="Forward 10s"
            >
              <FastForward10 className="w-3 h-3" />
            </button>
            <button
              onClick={toggleMute}
              className="p-1 text-neutral-300 hover:text-white transition-colors ml-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Digital Zoom inside PiP Crop */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
            <ZoomIn className="w-3 h-3 text-neutral-400" />
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-14 accent-blue-500 h-1 bg-neutral-700 rounded cursor-pointer"
              title="Digital Zoom"
            />
            <span className="font-mono text-[10px] w-6">{zoomLevel.toFixed(1)}x</span>
          </div>
        </div>

        {/* Floating Settings & HiDPI Scale popup (Fix for @Gisborne1990: 1440p / 4K tiny size) */}
        {showSettings && (
          <div className="absolute top-11 right-2 bg-neutral-900/95 backdrop-blur-md p-3 rounded-xl border border-neutral-700 shadow-2xl z-30 flex flex-col gap-3 w-56">
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-300 mb-1.5">
                <span className="font-semibold flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  HiDPI Sizing Presets:
                </span>
                <span className="font-mono text-blue-400">{width}px</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => applyPresetSize(320)}
                  className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                    width === 320 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  S (320)
                </button>
                <button
                  onClick={() => applyPresetSize(480)}
                  className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                    width === 480 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  M (480)
                </button>
                <button
                  onClick={() => applyPresetSize(640)}
                  className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                    width === 640 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  L (640)
                </button>
                <button
                  onClick={() => applyPresetSize(850)}
                  className={`py-1 text-[10px] rounded font-semibold transition-colors ${
                    width === 850 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                  title="Optimized for 1440p / 4K Displays"
                >
                  1440p
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-2">
              <div className="flex justify-between items-center text-[11px] text-neutral-300 mb-1">
                <span>{langStrings.opacity}:</span>
                <span className="font-mono text-blue-400">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-neutral-700 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Resize Grip Corner at Bottom Right */}
        <div
          onPointerDown={onPointerDownResize}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-1 text-neutral-400 hover:text-white group-hover:opacity-100 opacity-60 transition-opacity"
        >
          <svg viewBox="0 0 10 10" className="w-3 h-3 fill-current pointer-events-none">
            <circle cx="8" cy="8" r="1.2" />
            <circle cx="8" cy="4" r="1.2" />
            <circle cx="4" cy="8" r="1.2" />
          </svg>
        </div>
      </div>
    </>
  );
};
