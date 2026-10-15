import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Rect, RegionPrediction } from '../types';
import { Sparkles, Maximize2, Move, Ratio } from 'lucide-react';

interface CropperOverlayProps {
  containerWidth: number;
  containerHeight: number;
  cropRect: Rect;
  onChangeCropRect: (rect: Rect) => void;
  prediction: RegionPrediction | null;
  onApplyPrediction: () => void;
  langStrings: Record<string, string>;
}

type HandleType =
  | 'move'
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export const CropperOverlay: React.FC<CropperOverlayProps> = ({
  containerWidth,
  containerHeight,
  cropRect,
  onChangeCropRect,
  prediction,
  onApplyPrediction,
  langStrings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialRect: Rect;
  }>({ startX: 0, startY: 0, initialRect: cropRect });

  const minSize = 60;

  // Clamping function
  const clampRect = useCallback(
    (rect: Rect): Rect => {
      let x = Math.max(0, rect.x);
      let y = Math.max(0, rect.y);
      let width = Math.max(minSize, Math.min(containerWidth - x, rect.width));
      let height = Math.max(minSize, Math.min(containerHeight - y, rect.height));

      if (x + width > containerWidth) {
        x = containerWidth - width;
      }
      if (y + height > containerHeight) {
        y = containerHeight - height;
      }

      return {
        x: Math.round(Math.max(0, x)),
        y: Math.round(Math.max(0, y)),
        width: Math.round(Math.min(containerWidth, width)),
        height: Math.round(Math.min(containerHeight, height)),
      };
    },
    [containerWidth, containerHeight]
  );

  const handlePointerDown = (e: React.PointerEvent, handle: HandleType) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveHandle(handle);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialRect: { ...cropRect },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !containerRef.current) return;
    e.preventDefault();

    const clientW = Math.max(1, containerRef.current.clientWidth || 1);
    const clientH = Math.max(1, containerRef.current.clientHeight || 1);
    const scaleX = containerWidth / clientW;
    const scaleY = containerHeight / clientH;

    const dx = (e.clientX - dragStartRef.current.startX) * scaleX;
    const dy = (e.clientY - dragStartRef.current.startY) * scaleY;
    const init = dragStartRef.current.initialRect;

    let nextRect = { ...init };

    switch (activeHandle) {
      case 'move':
        nextRect.x = init.x + dx;
        nextRect.y = init.y + dy;
        break;
      case 'right':
        nextRect.width = init.width + dx;
        break;
      case 'bottom':
        nextRect.height = init.height + dy;
        break;
      case 'left':
        nextRect.x = init.x + dx;
        nextRect.width = init.width - dx;
        break;
      case 'top':
        nextRect.y = init.y + dy;
        nextRect.height = init.height - dy;
        break;
      case 'bottom-right':
        nextRect.width = init.width + dx;
        nextRect.height = init.height + dy;
        break;
      case 'bottom-left':
        nextRect.x = init.x + dx;
        nextRect.width = init.width - dx;
        nextRect.height = init.height + dy;
        break;
      case 'top-right':
        nextRect.y = init.y + dy;
        nextRect.width = init.width + dx;
        nextRect.height = init.height - dy;
        break;
      case 'top-left':
        nextRect.x = init.x + dx;
        nextRect.y = init.y + dy;
        nextRect.width = init.width - dx;
        nextRect.height = init.height - dy;
        break;
    }

    onChangeCropRect(clampRect(nextRect));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      setActiveHandle(null);
    }
  };

  // Preset aspect ratio quick application with full coordinate boundary check
  const applyPresetRatio = (ratioW: number, ratioH: number) => {
    const targetRatio = ratioW / ratioH;
    let w = Math.min(containerWidth, Math.max(60, cropRect.width));
    let h = Math.round(w / targetRatio);
    let x = cropRect.x;
    let y = cropRect.y;

    if (h > containerHeight) {
      h = containerHeight;
      w = Math.round(h * targetRatio);
    }
    if (x + w > containerWidth) {
      x = Math.max(0, containerWidth - w);
    }
    if (y + h > containerHeight) {
      y = Math.max(0, containerHeight - h);
    }
    onChangeCropRect(clampRect({ x, y, width: w, height: h }));
  };

  const currentRatio = (cropRect.width / Math.max(1, cropRect.height)).toFixed(2);

  // Percentage styles for CSS rendering
  const pctX = (cropRect.x / containerWidth) * 100;
  const pctY = (cropRect.y / containerHeight) * 100;
  const pctW = (cropRect.width / containerWidth) * 100;
  const pctH = (cropRect.height / containerHeight) * 100;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 z-20 overflow-hidden cursor-crosshair select-none"
    >
      {/* 4 Surrounding Darkening Masks matching PiP-Tool WPF CropperWindow:
          HideTop, HideLeft, HideBottom, HideRight */}
      {/* Top Mask */}
      <div
        className="absolute top-0 left-0 right-0 bg-black/75 pointer-events-none transition-all duration-75"
        style={{ height: `${pctY}%` }}
      />
      {/* Bottom Mask */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/75 pointer-events-none transition-all duration-75"
        style={{ height: `${100 - (pctY + pctH)}%` }}
      />
      {/* Left Mask */}
      <div
        className="absolute left-0 bg-black/75 pointer-events-none transition-all duration-75"
        style={{
          top: `${pctY}%`,
          height: `${pctH}%`,
          width: `${pctX}%`,
        }}
      />
      {/* Right Mask */}
      <div
        className="absolute right-0 bg-black/75 pointer-events-none transition-all duration-75"
        style={{
          top: `${pctY}%`,
          height: `${pctH}%`,
          width: `${100 - (pctX + pctW)}%`,
        }}
      />

      {/* Central Interactive Cropper Box */}
      <div
        className="absolute border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] touch-none cursor-move group"
        style={{
          left: `${pctX}%`,
          top: `${pctY}%`,
          width: `${pctW}%`,
          height: `${pctH}%`,
        }}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
      >
        {/* Subtle grid lines inside cropper */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-b border-blue-300/40" />
          <div className="border-r border-blue-300/40" />
          <div className="border-r border-blue-300/40" />
          <div />
        </div>

        {/* Center Drag Grip Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-medium text-blue-200 flex items-center gap-1.5 border border-blue-400/30">
            <Move className="w-3.5 h-3.5" />
            <span>{langStrings.dragThisWindow || 'Drag to reposition'}</span>
          </div>
        </div>

        {/* Info Coordinate Badge */}
        <div className="absolute -top-9 left-0 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-neutral-200 border border-neutral-700/80 flex items-center gap-2 pointer-events-none shadow-lg whitespace-nowrap">
          <span className="text-blue-400 font-semibold">{cropRect.width} × {cropRect.height}</span>
          <span className="text-neutral-400">({cropRect.x}, {cropRect.y})</span>
          <span className="text-emerald-400 bg-emerald-950/60 px-1 rounded">{currentRatio}:1</span>
        </div>

        {/* 8 Corner and Edge Resize Handles */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'top-left')}
          className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'top')}
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-ns-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'top-right')}
          className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'right')}
          className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-ew-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'bottom-right')}
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'bottom')}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-ns-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'bottom-left')}
          className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'left')}
          className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-ew-resize shadow-md hover:scale-125 transition-transform"
        />
      </div>

      {/* Floating Toolbar at the bottom for quick preset crops and AI prediction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-neutral-700/80 shadow-2xl flex items-center gap-2 pointer-events-auto">
        {prediction && (
          <button
            onClick={onApplyPrediction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            title={`${prediction.tag} (${Math.round(prediction.confidence * 100)}% confidence)`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>{langStrings.aiPrediction || 'AI Smart Crop'}</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-blue-100">
              {Math.round(prediction.confidence * 100)}%
            </span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-neutral-700 mx-1" />

        <button
          onClick={() => applyPresetRatio(16, 9)}
          className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1 font-mono"
          title="Aspect Ratio 16:9"
        >
          <Ratio className="w-3 h-3 text-neutral-400" />
          16:9
        </button>

        <button
          onClick={() => applyPresetRatio(4, 3)}
          className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-mono"
          title="Aspect Ratio 4:3"
        >
          4:3
        </button>

        <button
          onClick={() => applyPresetRatio(1, 1)}
          className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-mono"
          title="Aspect Ratio 1:1"
        >
          1:1
        </button>

        <button
          onClick={() =>
            onChangeCropRect({
              x: 0,
              y: 0,
              width: containerWidth,
              height: containerHeight,
            })
          }
          className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1"
          title="Full Window"
        >
          <Maximize2 className="w-3 h-3 text-neutral-400" />
          {langStrings.resetCrop || 'Full'}
        </button>
      </div>
    </div>
  );
};
