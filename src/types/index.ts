export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowProcessInfo {
  id: string;
  hwnd: string; // e.g. "0x002A0B42"
  pid: number;
  executable: string; // e.g. "chrome.exe"
  title: string;
  program: string;
  width: number;
  height: number;
  icon?: string;
  videoUrl?: string;
  aspectRatio?: number;
}

// Alias for backwards compatibility across components
export type WindowInfo = WindowProcessInfo;

export interface WindowData {
  region: string; // "top left height width"
  program: string;
  windowTitle: string;
  windowTop: number;
  windowLeft: number;
  windowHeight: number;
  windowWidth: number;
  timestamp?: number;
  isFavorite?: boolean;
}

export interface RegionPrediction {
  top: number;
  left: number;
  height: number;
  width: number;
  confidence: number;
  tag: string;
}

export type Language = 'en' | 'ru';

export type PiPPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
