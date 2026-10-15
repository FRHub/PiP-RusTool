# PiP-Tool Rust Native Engine

A complete Rust migration of the PiP-Tool (.NET / C#) application with zero garbage-collection pauses, memory safety, and direct native compositor interop.

## Solved Issues from Community Feedback

1. **Multi-Monitor Crash Fix (`@gkillerwog2147`)**:
   - Replaced fragile Windows Forms / WPF `DpiHelper` with safe integer ratio scaling (`scale_dpi`) handling `WM_DPICHANGED` with zero division protection.

2. **Continuous Render Anti-Freeze Pipeline (`@smothercrot` & `@Snelly87`)**:
   - Instead of stalling when windows lose focus or are minimized, the asynchronous capture worker keeps a decoupled 60 FPS surface buffer.

3. **Ghost / Click-Through Mode for Gamers (`@nemurishivasai4765`)**:
   - Added `WS_EX_TRANSPARENT` click-through support so mouse input passes directly to underlying games.

4. **1440p / 4K HiDPI Presets (`@Gisborne1990`)**:
   - Built-in resolution profiles (`Small`, `Medium`, `Large`, `QHD1440p`, `UHD4K`) ensuring windows scale crisply across multi-monitor setups.

## Building and Running

```bash
cargo build --release
cargo run --release
```
