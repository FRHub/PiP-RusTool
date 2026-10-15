import React, { useEffect, useRef } from 'react';
import { WindowInfo } from '../types';

interface WindowContentViewProps {
  windowInfo: WindowInfo;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const WindowContentView: React.FC<WindowContentViewProps> = ({
  windowInfo,
  videoRef,
  canvasRef,
}) => {
  const stockDataRef = useRef<{ price: number; history: number[] }>({
    price: 64820,
    history: [64200, 64350, 64180, 64500, 64420, 64600, 64750, 64680, 64820],
  });

  // Trading view simulated price tick without triggering React component re-renders
  useEffect(() => {
    if (windowInfo.id !== 'tradingview_app') return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 80;
      const next = Math.round(stockDataRef.current.price + delta);
      stockDataRef.current.price = next;
      stockDataRef.current.history = [...stockDataRef.current.history.slice(-25), next];
    }, 1200);
    return () => clearInterval(interval);
  }, [windowInfo.id]);

  // Continuous canvas render for simulated DWM thumbnail surfaces
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      if (windowInfo.videoUrl && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
      } else if (windowInfo.id === 'tradingview_app') {
        // Draw trading chart on canvas
        ctx.fillStyle = '#131722';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = '#2a2e39';
        ctx.lineWidth = 1;
        for (let x = 60; x < w; x += 100) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 50; y < h; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Header bar
        const currentPrice = stockDataRef.current.price;
        const currentHistory = stockDataRef.current.history;

        ctx.fillStyle = '#1e222d';
        ctx.fillRect(0, 0, w, 44);
        ctx.fillStyle = '#f0f3fa';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('BTC / USD · 1D · Coinbase (HWND: ' + windowInfo.hwnd + ')', 20, 28);
        ctx.fillStyle = currentPrice >= 64500 ? '#089981' : '#f23645';
        ctx.fillText(`$${currentPrice.toLocaleString()}`, 380, 28);

        // Draw candlesticks & trend
        const len = currentHistory.length;
        const minVal = Math.min(...currentHistory) - 100;
        const maxVal = Math.max(...currentHistory) + 100;
        const stepX = (w - 200) / Math.max(1, len);

        ctx.beginPath();
        currentHistory.forEach((val: number, idx: number) => {
          const posX = 80 + idx * stepX;
          const posY = h - 100 - ((val - minVal) / Math.max(1, maxVal - minVal)) * (h - 220);
          if (idx === 0) ctx.moveTo(posX, posY);
          else ctx.lineTo(posX, posY);
        });
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Candlestick bodies
        currentHistory.forEach((val: number, idx: number) => {
          const posX = 80 + idx * stepX;
          const posY = h - 100 - ((val - minVal) / Math.max(1, maxVal - minVal)) * (h - 220);
          const isGreen = idx % 2 === 0;
          ctx.fillStyle = isGreen ? '#089981' : '#f23645';
          ctx.fillRect(posX - 6, posY - 15, 12, 30);
          ctx.strokeStyle = isGreen ? '#089981' : '#f23645';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(posX, posY - 28);
          ctx.lineTo(posX, posY + 28);
          ctx.stroke();
        });

        // Pulsing live indicator
        const pulse = (Math.sin(frame * 0.1) + 1) * 3;
        ctx.fillStyle = '#089981';
        ctx.beginPath();
        ctx.arc(w - 60, 25, 4 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText('LIVE', w - 40, 29);
      } else if (windowInfo.id === 'vscode_workspace') {
        // VS Code simulated canvas
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, w, h);

        // Sidebar
        ctx.fillStyle = '#252526';
        ctx.fillRect(0, 0, 50, h);
        ctx.fillStyle = '#333333';
        ctx.fillRect(50, 0, 220, h);

        // Tab bar
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(270, 0, w - 270, 35);
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(270, 0, 220, 35);
        ctx.fillStyle = '#cccccc';
        ctx.font = '13px monospace';
        ctx.fillText('src/window.rs (Rust Engine) ✕', 285, 22);

        // Code content
        ctx.fillStyle = '#858585';
        for (let i = 1; i <= 35; i++) {
          ctx.fillText(`${i}`, 285, 55 + i * 18);
        }

        ctx.fillStyle = '#569cd6';
        ctx.fillText('pub struct', 330, 55 + 18);
        ctx.fillStyle = '#4ec9b0';
        ctx.fillText('PipWindow', 415, 55 + 18);
        ctx.fillStyle = '#d4d4d4';
        ctx.fillText('{ config: PipWindowConfig }', 500, 55 + 18);

        ctx.fillStyle = '#569cd6';
        ctx.fillText('impl', 330, 55 + 54);
        ctx.fillStyle = '#4ec9b0';
        ctx.fillText('PipWindow', 370, 55 + 54);

        ctx.fillStyle = '#569cd6';
        ctx.fillText('pub fn', 350, 55 + 90);
        ctx.fillStyle = '#dcdcaa';
        ctx.fillText('set_click_through', 405, 55 + 90);
        ctx.fillStyle = '#d4d4d4';
        ctx.fillText('(&mut self, enable: bool) {', 545, 55 + 90);

        ctx.fillStyle = '#6a9955';
        ctx.fillText('// Set WS_EX_TRANSPARENT on Win32 HWND for FPS gaming', 370, 55 + 126);

        ctx.fillStyle = '#c586c0';
        ctx.fillText('self.config.click_through = enable;', 370, 55 + 162);
        ctx.fillStyle = '#d4d4d4';
        ctx.fillText('}', 350, 55 + 198);

        // Minimap
        ctx.fillStyle = '#252526';
        ctx.fillRect(w - 110, 35, 110, h - 35);
        ctx.fillStyle = '#3a3d41';
        ctx.fillRect(w - 95, 60, 80, 120);
      } else if (windowInfo.id === 'acrobat_reader') {
        // PDF paper canvas
        ctx.fillStyle = '#525659';
        ctx.fillRect(0, 0, w, h);

        const pw = 680;
        const ph = h - 60;
        const px = (w - pw) / 2;
        const py = 30;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 15;
        ctx.fillRect(px, py, pw, ph);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 20px serif';
        ctx.fillText('Windows Desktop Window Manager (DWM) Thumbnail Pipeline', px + 40, py + 50);
        ctx.font = 'italic 13px serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText('Rust and Zig Native Architectural Blueprint', px + 40, py + 75);

        ctx.fillStyle = '#1f2937';
        ctx.font = '12px serif';
        const lorem = [
          'Windows DWM API provides direct GPU-backed window composition through',
          'DwmRegisterThumbnail and DwmUpdateThumbnailProperties. The native Rust',
          'and Zig engines hook directly into the Win32 Desktop Window Manager,',
          'delivering zero-copy frame transport and sub-millisecond latency.',
        ];
        lorem.forEach((line, idx) => {
          ctx.fillText(line, px + 40, py + 115 + idx * 18);
        });

        // Schematic diagram
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = '#eff6ff';
        ctx.lineWidth = 2;
        ctx.fillRect(px + 40, py + 230, 300, 140);
        ctx.strokeRect(px + 40, py + 230, 300, 140);

        ctx.fillStyle = '#1d4ed8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Win32 DWM Thumbnail Architecture', px + 55, py + 260);

        ctx.fillStyle = '#374151';
        ctx.font = '11px sans-serif';
        ctx.fillText('• dwmapi!DwmRegisterThumbnail()', px + 65, py + 290);
        ctx.fillText('• user32!SetWindowLongPtr(WS_EX_TRANSPARENT)', px + 65, py + 310);
        ctx.fillText('• user32!SetProcessDpiAwarenessContext()', px + 65, py + 330);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [windowInfo, videoRef, canvasRef]);

  return (
    <div className="relative w-full h-full bg-[#18181b] overflow-hidden flex items-center justify-center">
      {/* Underlying Canvas that renders active window content */}
      <canvas
        ref={canvasRef}
        width={windowInfo.width || 1280}
        height={windowInfo.height || 720}
        className="w-full h-full object-contain block bg-[#09090b]"
      />

      {/* Hidden Video element for video playback */}
      <video
        ref={videoRef}
        src={windowInfo.videoUrl}
        autoPlay
        playsInline
        muted
        loop
        crossOrigin="anonymous"
        className="hidden"
      />
    </div>
  );
};
