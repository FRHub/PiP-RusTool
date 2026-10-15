import React, { useRef, useState, useEffect } from 'react';
import { WindowInfo } from '../types';
import {
  GripVertical,
  ChevronDown,
  Settings,
  Power,
  AppWindow,
} from 'lucide-react';

interface MainWindowBarProps {
  windows: WindowInfo[];
  selectedWindow: WindowInfo | null;
  onSelectWindow: (win: WindowInfo) => void;
  onOpenConfig: () => void;
  onStop: () => void;
  isPipActive: boolean;
  langStrings: Record<string, string>;
}

export const MainWindowBar: React.FC<MainWindowBarProps> = ({
  windows,
  selectedWindow,
  onSelectWindow,
  onOpenConfig,
  onStop,
  isPipActive,
  langStrings,
}) => {
  // Draggable topbar position (default centered at top)
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: Math.max(20, (typeof window !== 'undefined' ? window.innerWidth / 2 - 250 : 200)),
    y: 20,
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Re-center on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => ({
        x: Math.min(Math.max(10, prev.x), window.innerWidth - 480),
        y: Math.min(Math.max(10, prev.y), window.innerHeight - 80),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 420, dragStartRef.current.startX + dx)),
      y: Math.max(10, Math.min(window.innerHeight - 60, dragStartRef.current.startY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      isDraggingRef.current = false;
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="fixed z-40 flex items-center gap-2 bg-[#2D2D30]/95 backdrop-blur-md border border-[#3e3e42] shadow-[0_12px_36px_rgba(0,0,0,0.65)] rounded-xl px-2.5 py-1.5 select-none text-white h-[44px] transition-shadow hover:shadow-[0_16px_44px_rgba(0,0,0,0.8)]"
    >
      {/* 1. Drag Button (matching WPF Label x:Name="drag") */}
      <button
        onPointerDown={handlePointerDown}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/80 cursor-grab active:cursor-grabbing transition-colors shrink-0"
        title="Drag PiP-Tool bar"
      >
        <GripVertical className="w-4 h-4 pointer-events-none" />
      </button>

      {/* 2. Dropdown List of the Opened Windows (matching WPF ComboBox x:Name="windowsList") */}
      <div className="relative w-64 sm:w-80">
        <select
          value={selectedWindow?.id || ''}
          onChange={(e) => {
            const found = windows.find((w) => w.id === e.target.value);
            if (found) onSelectWindow(found);
          }}
          title={langStrings.selectWindow || 'Select open window'}
          className="w-full bg-[#1e1e20] text-neutral-200 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-neutral-700/80 focus:outline-none focus:border-blue-500 appearance-none font-medium truncate cursor-pointer shadow-inner"
        >
          <option value="" disabled>
            Select a window to PiP...
          </option>
          {windows.map((win) => (
            <option key={win.id} value={win.id}>
              [{win.executable}] {win.title}
            </option>
          ))}
        </select>
        <AppWindow className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 3. Config Icon */}
      <button
        onClick={onOpenConfig}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
        title="Configuration & Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* 4. Stop Icon */}
      <button
        onClick={onStop}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
          isPipActive
            ? 'bg-red-600/90 hover:bg-red-600 text-white shadow-sm'
            : 'text-neutral-400 hover:text-red-400 hover:bg-red-950/40'
        }`}
        title={isPipActive ? 'Stop PiP Mode' : 'Close / Stop'}
      >
        <Power className="w-4 h-4" />
      </button>
    </div>
  );
};
