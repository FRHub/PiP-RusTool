import { WindowData, RegionPrediction, WindowInfo } from '../types';

const STORAGE_KEY = 'pip_tool_ml_data_v1';

const INITIAL_TRAINING_DATA: WindowData[] = [
  {
    region: '40 80 540 960',
    program: 'YouTube',
    windowTitle: 'YouTube - Lofi Hip Hop Radio & Ambient Beats',
    windowTop: 0,
    windowLeft: 0,
    windowHeight: 720,
    windowWidth: 1280,
    timestamp: Date.now() - 3600000,
  },
  {
    region: '60 30 500 890',
    program: 'Twitch',
    windowTitle: 'Twitch - Pro Gaming Live Stream / Tournament',
    windowTop: 0,
    windowLeft: 0,
    windowHeight: 720,
    windowWidth: 1280,
    timestamp: Date.now() - 2400000,
  },
  {
    region: '35 48 580 820',
    program: 'Code',
    windowTitle: 'VS Code - PiP-Tool.MachineLearning/Predictor.cs',
    windowTop: 0,
    windowLeft: 0,
    windowHeight: 720,
    windowWidth: 1280,
    timestamp: Date.now() - 1800000,
  },
  {
    region: '45 15 520 900',
    program: 'TradingView',
    windowTitle: 'TradingView - BTC/USD & Tech Stock Live Candlesticks',
    windowTop: 0,
    windowLeft: 0,
    windowHeight: 720,
    windowWidth: 1280,
    timestamp: Date.now() - 1200000,
  },
  {
    region: '70 120 560 760',
    program: 'Acrobat',
    windowTitle: 'PDF Reader - Research Paper & Architectural Blueprint',
    windowTop: 0,
    windowLeft: 0,
    windowHeight: 720,
    windowWidth: 1280,
    timestamp: Date.now() - 600000,
  },
  {
    region: '0 0 100 100',
    program: 'PiP',
    windowTitle: 'PiP',
    windowTop: 0,
    windowLeft: 0,
    windowHeight: 100,
    windowWidth: 100,
    timestamp: Date.now() - 4000000,
  },
];

class MachineLearningService {
  private data: WindowData[] = [];
  private isTrained: boolean = false;

  constructor() {
    this.loadData();
  }

  public loadData(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.data = parsed.filter(
            (item: any) =>
              item &&
              typeof item.region === 'string' &&
              typeof item.program === 'string' &&
              typeof item.windowWidth === 'number'
          );
          if (this.data.length === 0) {
            this.data = [...INITIAL_TRAINING_DATA];
          }
        } else {
          this.data = [...INITIAL_TRAINING_DATA];
        }
      } else {
        this.data = [...INITIAL_TRAINING_DATA];
        this.saveData();
      }
    } catch {
      this.data = [...INITIAL_TRAINING_DATA];
    }
    this.isTrained = true;
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to persist ML data to localStorage', e);
    }
  }

  public getData(): WindowData[] {
    return [...this.data];
  }

  public clearData(): void {
    this.data = [...INITIAL_TRAINING_DATA];
    this.saveData();
  }

  public addData(
    regionStr: string,
    program: string,
    windowTitle: string,
    windowTop: number,
    windowLeft: number,
    windowHeight: number,
    windowWidth: number
  ): void {
    const entry: WindowData = {
      region: regionStr,
      program,
      windowTitle,
      windowTop,
      windowLeft,
      windowHeight,
      windowWidth,
      timestamp: Date.now(),
    };
    this.data.unshift(entry);
    // Keep max 50 recent training samples
    if (this.data.length > 50) {
      this.data = this.data.slice(0, 50);
    }
    this.saveData();
  }

  /**
   * Predict optimal crop region given window metadata
   * Uses weighted similarity matching across program, title tokens, and window aspect ratio/scale
   */
  public predict(windowInfo: WindowInfo): RegionPrediction {
    const winW = Math.max(100, windowInfo.width || 1280);
    const winH = Math.max(100, windowInfo.height || 720);

    if (!this.data.length) {
      const w = Math.round(winW * 0.75);
      const h = Math.round(w * (9 / 16));
      return {
        top: Math.max(10, Math.round((winH - h) / 2)),
        left: Math.max(10, Math.round((winW - w) / 2)),
        width: Math.min(winW - 20, w),
        height: Math.min(winH - 20, h),
        confidence: 0.7,
        tag: 'Default Center 16:9',
      };
    }

    const targetProg = (windowInfo.program || '').toLowerCase();
    const targetTitle = (windowInfo.title || '').toLowerCase();

    // Check direct matching program
    let bestMatch: WindowData | null = null;
    let highestScore = -1;

    for (const item of this.data) {
      let score = 0;
      const itemProg = (item.program || '').toLowerCase();
      const itemTitle = (item.windowTitle || '').toLowerCase();

      // Program exact or partial match
      if (itemProg && itemProg === targetProg) {
        score += 50;
      } else if (itemProg && targetProg && (itemProg.includes(targetProg) || targetProg.includes(itemProg))) {
        score += 30;
      }

      // Title word intersection
      const targetWords = targetTitle.split(/\s+/).filter((w) => w.length > 2);
      const itemWords = itemTitle.split(/\s+/).filter((w) => w.length > 2);
      let commonWords = 0;
      for (const w of targetWords) {
        if (itemWords.includes(w)) commonWords++;
      }
      score += commonWords * 15;

      // Dimension ratio closeness
      const targetAspect = winW / winH;
      const itemAspect = Math.max(1, item.windowWidth) / Math.max(1, item.windowHeight);
      const aspectDiff = Math.abs(targetAspect - itemAspect);
      if (aspectDiff < 0.1) score += 20;
      else if (aspectDiff < 0.3) score += 10;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore >= 20) {
      const parts = (bestMatch.region || '').trim().split(/\s+/).map(Number);
      if (parts.length === 4 && !parts.some(isNaN)) {
        const [mTop, mLeft, mHeight, mWidth] = parts;
        const scaleX = winW / Math.max(1, bestMatch.windowWidth);
        const scaleY = winH / Math.max(1, bestMatch.windowHeight);

        const scaledW = Math.max(60, Math.min(winW, Math.round(mWidth * scaleX)));
        const scaledH = Math.max(60, Math.min(winH, Math.round(mHeight * scaleY)));
        const scaledLeft = Math.max(0, Math.min(winW - scaledW, Math.round(mLeft * scaleX)));
        const scaledTop = Math.max(0, Math.min(winH - scaledH, Math.round(mTop * scaleY)));

        const conf = Math.min(0.99, 0.6 + highestScore / 150);
        return {
          top: scaledTop,
          left: scaledLeft,
          height: scaledH,
          width: scaledW,
          confidence: Math.round(conf * 100) / 100,
          tag: `ML Match: ${bestMatch.program}`,
        };
      }
    }

    // Heuristics
    if (targetTitle.includes('youtube') || targetTitle.includes('video') || targetTitle.includes('stream')) {
      const w = Math.round(winW * 0.8);
      const h = Math.round(w * (9 / 16));
      return {
        top: Math.max(0, Math.round((winH - h) / 2)),
        left: Math.max(0, Math.round((winW - w) / 2)),
        width: Math.min(winW, w),
        height: Math.min(winH, h),
        confidence: 0.85,
        tag: 'Auto-heuristic (Video Stream)',
      };
    }

    const defaultW = Math.round(winW * 0.7);
    const defaultH = Math.round(winH * 0.7);
    return {
      top: Math.max(0, Math.round((winH - defaultH) / 2)),
      left: Math.max(0, Math.round((winW - defaultW) / 2)),
      width: Math.min(winW, defaultW),
      height: Math.min(winH, defaultH),
      confidence: 0.72,
      tag: 'Auto-heuristic (Center Region)',
    };
  }
}

export const mlService = new MachineLearningService();
