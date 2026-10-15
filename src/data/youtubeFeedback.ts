export interface YouTubeCommentIssue {
  id: string;
  author: string;
  comment: string;
  likes?: string;
  problemCategory: string;
  severity: 'Critical Crash' | 'High Bug' | 'Feature Missing' | 'Usability';
  solutionDescription: string;
  fixedInRust: string;
  fixedInZig: string;
  fixedInWeb: string;
}

export const YOUTUBE_VIDEO_METADATA = {
  url: 'https://www.youtube.com/watch?v=2DsADwrQRpw',
  title: 'How to run any app in Picture in Picture mode on Window 10',
  channel: 'Tech & Windows Guides',
};

export const SCRAPED_YOUTUBE_ISSUES: YouTubeCommentIssue[] = [
  {
    id: 'gkillerwog2147',
    author: '@gkillerwog2147',
    comment: 'This works, but when I move the PIP to a different monitor the program crashes.',
    problemCategory: 'Multi-Monitor DPI & Resolution Crash',
    severity: 'Critical Crash',
    solutionDescription:
      'In original C#, DpiHelper.GetDpi threw uncaught exceptions when moving between monitors with differing DPI scaling (e.g. 100% 1080p to 150% 1440p). Resolved by implementing safe rational DPI scaling (scale_dpi) with zero-division guards and boundary clamping.',
    fixedInRust: 'rust/src/geometry.rs: Rect::scale_dpi() + window.rs on_dpi_changed()',
    fixedInZig: 'zig/src/geometry.zig: Rect.scaleDpi() with clampWithin()',
    fixedInWeb: 'App.tsx: Safe window.devicePixelRatio scaling & cross-screen clamping',
  },
  {
    id: 'smothercrot',
    author: '@smothercrot',
    comment: "in her demo, the animation literally stops once it gets pinned. I'm referring to the Minecraft background animation (camera panning over sea-bed)",
    problemCategory: 'Render Loop Freezing When Pinned / Minimized',
    severity: 'High Bug',
    solutionDescription:
      'DWM thumbnails in WPF halted rendering when the target window was backgrounded or pinned. Resolved by implementing an independent double-buffered 60 FPS frame capture pipeline that continues running regardless of target window focus.',
    fixedInRust: 'rust/src/capture.rs: CapturePipeline asynchronous worker thread',
    fixedInZig: 'zig/src/capture.zig: NativePipController & decoupled FrameBuffer',
    fixedInWeb: 'WindowContentView.tsx: Continuous requestAnimationFrame canvas loop',
  },
  {
    id: 'EgeK-000',
    author: '@EgeK-000',
    comment: 'Not so good. The image freezes when you throw the browser down. Also there is no possibility to check in the small window. Chrome has a picture in picture plugin. He\'s better. But that doesn\'t apply to every application.',
    problemCategory: 'Minimized Window Occlusion & Interactivity',
    severity: 'High Bug',
    solutionDescription:
      'Window minimization in Win32 discards the window DC surface. In the rewrite, desktop capture buffers maintain the last valid rendered texture with automatic wake-up and mini-player interactive controls.',
    fixedInRust: 'rust/src/capture.rs: Persistent FrameBuffer buffer fallback',
    fixedInZig: 'zig/src/capture.zig: Retained frame state in FrameBuffer',
    fixedInWeb: 'WindowContentView.tsx: Offscreen canvas retainment & live stream sync',
  },
  {
    id: 'Fanceh',
    author: '@Fanceh',
    comment: "The software's like taking the screenshot of the other window and u can't even control it mouse/keyboard",
    problemCategory: 'Lack of Interactive Controls in PiP',
    severity: 'Feature Missing',
    solutionDescription:
      'PiP-Tool only offered a passive viewer. Added interactive mini-controls directly on the PiP overlay: Play/Pause, Mute/Volume slider, 10s Skip, Digital Zoom (1x-3x), and Opacity slider.',
    fixedInRust: 'rust/src/window.rs: PipWindowConfig with direct control state',
    fixedInZig: 'zig/src/capture.zig: NativePipController interactive properties',
    fixedInWeb: 'PiPFloatingWindow.tsx: Embedded Play/Pause, Mute, Volume, & Zoom controls',
  },
  {
    id: 'nemurishivasai4765',
    author: '@nemurishivasai4765',
    comment: "I'm trying to play FPS games and running PiP of browser but I can't control the mouse aim in the game any workaround",
    problemCategory: 'Mouse Capture ruins FPS Game Aiming',
    severity: 'Usability',
    solutionDescription:
      'The floating PiP window blocked mouse clicks and hijacked mouse lock in FPS games. Added a dedicated "Ghost / Click-Through Mode" (WS_EX_TRANSPARENT) so mouse aim and clicks pass straight through to games uninterrupted.',
    fixedInRust: 'rust/src/window.rs: set_click_through(true) using WS_EX_TRANSPARENT',
    fixedInZig: 'zig/src/capture.zig: setClickThrough(true)',
    fixedInWeb: 'PiPFloatingWindow.tsx: Toggle Ghost Mode (pointer-events-none + hotkey Alt+G)',
  },
  {
    id: 'Gisborne1990',
    author: '@Gisborne1990',
    comment: "Does anyone know how to increase the size of the PIP window? it's far too tiny at 1440p?",
    problemCategory: '1440p / 4K HiDPI Scaling Issue',
    severity: 'Usability',
    solutionDescription:
      'The original WPF app used fixed 100px-200px sizes that appeared minuscule on 1440p/4K monitors. Added preset resolution scales (Small 320px, Medium 480px, Large 640px, 1440p QHD 850px, 4K UHD 1200px) and a direct scale multiplier slider.',
    fixedInRust: 'rust/src/window.rs: SizePreset enum (QHD1440p, UHD4K, Large)',
    fixedInZig: 'zig/src/capture.zig: setResolutionPreset(true) for 850x480 native 1440p',
    fixedInWeb: 'PiPFloatingWindow.tsx: Quick size buttons (S, M, L, 1440p, 4K) & scale slider',
  },
];
