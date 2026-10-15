import React, { useState, useRef, useCallback } from 'react';
import { Rect, RegionPrediction } from '../types';
import { Sparkles, Move } from 'lucide-react';

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
          <div className="border-r border-b border-blue-300/40" />
          <div className="border-r border-b border-blue-300/40" />
          <div />
        </div>

        {/* Center Drag Grip Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-medium text-blue-200 flex items-center gap-1.5 border border-blue-400/30">
            <Move className="w-3.5 h-3.5" />
            <span>{langStrings.dragThisWindow || 'Drag to reposition'}</span>
          </div>
        </div>

        {/* Info Coordinate Badge & AI Smart Crop trigger */}
        <div className="absolute -top-9 left-0 flex items-center gap-2 pointer-events-auto shadow-lg whitespace-nowrap">
          <div className="bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-neutral-200 border border-neutral-700/80 flex items-center gap-2 pointer-events-none">
            <span className="text-blue-400 font-semibold">{cropRect.width} × {cropRect.height}</span>
            <span className="text-neutral-400">({cropRect.x}, {cropRect.y})</span>
            <span className="text-emerald-400 bg-emerald-950/60 px-1 rounded">{currentRatio}:1</span>
          </div>

          {prediction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApplyPrediction();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600/90 hover:bg-blue-500 text-white text-[11px] font-medium border border-blue-400/50 shadow-md transition-all active:scale-95"
              title={`${prediction.tag} (${Math.round(prediction.confidence * 100)}% confidence)`}
            >
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
              <span>{langStrings.aiPrediction || 'AI Crop'}</span>
            </button>
          )}
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
    </div>
  );
};
