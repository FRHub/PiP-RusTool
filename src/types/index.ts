export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowInfo {
  id: string;
  title: string;
  program: string;
  type: 'screen_share' | 'simulated' | 'custom_media';
  width: number;
  height: number;
  icon?: string;
  videoUrl?: string;
  aspectRatio?: number;
}

export interface WindowData {
  region: string; // "top left height width"
  program: string;
  windowTitle: string;
  windowTop: number;
  windowLeft: number;
  windowHeight: number;
  windowWidth: number;
  timestamp?: number;
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
