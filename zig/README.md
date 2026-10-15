# PiP-Tool Zig Native Engine

A complete Zig rewrite of PiP-Tool offering sub-millisecond frame throughput, zero runtime garbage collection pauses, explicit allocation safety, and direct window compositor integration.

## Resolved YouTube Issues

1. **Multi-Monitor DPI Exception Fix (`@gkillerwog2147`)**:
   - `geometry.zig` uses safe fractional scaling and integer clamping to completely eliminate multi-monitor moving crashes.

2. **Window Occlusion Anti-Freeze (`@smothercrot` & `@Snelly87`)**:
   - `capture.zig` runs a dedicated ring-buffer frame pipeline that retains rendering updates when applications are hidden or minimized.

3. **Click-Through / Ghost Mode for Gamers (`@nemurishivasai4765`)**:
   - `NativePipController.setClickThrough(true)` sets the window transparent to mouse hits so gamers never lose aim control.

4. **1440p / 4K Scaling Support (`@Gisborne1990`)**:
   - Instant resolution presets (`setResolutionPreset`) allow 1440p and 4K displays to display readable, large PiP overlays.

## Building and Running

```bash
zig build run
```
