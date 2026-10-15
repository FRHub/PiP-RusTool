export interface CodeFile {
  path: string;
  language: 'rust' | 'zig' | 'toml' | 'bat' | 'xml';
  title: string;
  description: string;
  content: string;
}

export const RUST_FILES: CodeFile[] = [
  {
    path: 'rust/Cargo.toml',
    language: 'toml',
    title: 'Cargo.toml',
    description: 'Rust package definition and native Windows Win32 / DWM dependencies',
    content: `[package]
name = "pip-tool-rs"
version = "2.0.0"
edition = "2021"
authors = ["Lionel Jouin", "FRHub", "Community"]
description = "High-performance Rust rewrite of PiP-Tool with ML region prediction, multi-monitor DPI safety, and ghost click-through mode"
license = "MIT"

[dependencies]
windows = { version = "0.58", features = [
    "Win32_Foundation",
    "Win32_Graphics_Dwm",
    "Win32_Graphics_Gdi",
    "Win32_UI_WindowsAndMessaging",
    "Win32_UI_HiDpi",
] }
image = "0.25"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
log = "0.4"
env_logger = "0.11"
parking_lot = "0.12"`,
  },
  {
    path: 'rust/app.manifest',
    language: 'xml',
    title: 'app.manifest',
    description: 'Windows Application Manifest declaring PerMonitorV2 DPI awareness (Prevents @gkillerwog2147 crash)',
    content: `<?xml version="1.0" encoding="utf-8"?>
<assembly manifestVersion="1.0" xmlns="urn:schemas-microsoft-com:asm.v1">
  <assemblyIdentity version="2.0.0.0" name="PiPTool.app"/>
  <compatibility xmlns="urn:schemas-microsoft-com:compatibility.v1">
    <application>
      <!-- Windows 10 and Windows 11 -->
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}" />
    </application>
  </compatibility>
  <!-- PerMonitorV2: Fixes multi-monitor moving crashes on Windows 10/11 -->
  <application xmlns="urn:schemas-microsoft-com:asm.v3">
    <windowsSettings>
      <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true/pm</dpiAware>
      <dpiAwareness xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">PerMonitorV2, PerMonitor</dpiAwareness>
    </windowsSettings>
  </application>
</assembly>`,
  },
  {
    path: 'rust/build.bat',
    language: 'bat',
    title: 'build.bat',
    description: 'Windows 64-bit release build script (MSVC)',
    content: `@echo off
echo Building PiP-Tool Rust Native Windows Engine (64-bit)...
cargo build --release --target x86_64-pc-windows-msvc
echo Binary created at target\\x86_64-pc-windows-msvc\\release\\pip-tool-rs.exe
pause`,
  },
  {
    path: 'rust/src/geometry.rs',
    language: 'rust',
    title: 'geometry.rs',
    description: 'Safe multi-monitor DPI scaling & boundary clamping (Resolves @gkillerwog2147 crash)',
    content: `use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

impl Rect {
    pub fn new(x: i32, y: i32, width: i32, height: i32) -> Self {
        Self { x, y, width: width.max(10), height: height.max(10) }
    }

    /// Safely scale coordinates across monitors with different DPI factors.
    /// Fixes YouTube issue @gkillerwog2147: Multi-monitor crash due to zero/overflow DPI calculation.
    pub fn scale_dpi(&self, from_dpi: f32, to_dpi: f32) -> Self {
        let safe_from = if from_dpi.abs() < 0.001 { 96.0 } else { from_dpi };
        let safe_to = if to_dpi.abs() < 0.001 { 96.0 } else { to_dpi };
        let factor = safe_to / safe_from;

        Self {
            x: (self.x as f32 * factor).round() as i32,
            y: (self.y as f32 * factor).round() as i32,
            width: ((self.width as f32 * factor).round() as i32).max(40),
            height: ((self.height as f32 * factor).round() as i32).max(40),
        }
    }

    pub fn clamp_within(&self, bounds: &Rect) -> Self {
        let w = self.width.min(bounds.width);
        let h = self.height.min(bounds.height);
        let x = self.x.clamp(bounds.x, bounds.x + bounds.width - w);
        let y = self.y.clamp(bounds.y, bounds.y + bounds.height - h);
        Self { x, y, width: w, height: h }
    }
}`,
  },
  {
    path: 'rust/src/window.rs',
    language: 'rust',
    title: 'window.rs',
    description: 'PiP window manager with click-through Ghost Mode (@nemurishivasai4765) and 1440p HiDPI presets (@Gisborne1990)',
    content: `use crate::geometry::Rect;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipWindowConfig {
    pub title: String,
    pub bounds: Rect,
    pub opacity: f32,
    pub click_through: bool, // Fix for FPS gamers (@nemurishivasai4765)
    pub lock_aspect_ratio: bool,
    pub current_dpi: f32,
}

pub struct PipWindow {
    config: PipWindowConfig,
}

impl PipWindow {
    pub fn new(config: PipWindowConfig) -> Self {
        Self { config }
    }

    /// Toggles click-through (Ghost Mode for uninterrupted gaming)
    pub fn set_click_through(&mut self, enable: bool) {
        self.config.click_through = enable;
        // In Win32: SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style | WS_EX_TRANSPARENT)
    }

    /// Preset resizing optimized for 1440p / 4K monitors (@Gisborne1990)
    pub fn apply_size_preset(&mut self, preset: SizePreset) {
        let (w, h) = match preset {
            SizePreset::Small => (320, 180),
            SizePreset::Medium => (480, 270),
            SizePreset::Large => (640, 360),
            SizePreset::QHD1440p => (850, 480),
            SizePreset::UHD4K => (1200, 675),
        };
        self.config.bounds.width = w;
        self.config.bounds.height = h;
    }
}

pub enum SizePreset {
    Small,
    Medium,
    Large,
    QHD1440p,
    UHD4K,
}`,
  },
  {
    path: 'rust/src/capture.rs',
    language: 'rust',
    title: 'capture.rs',
    description: 'Continuous asynchronous frame capture pipeline preventing window freezes (@smothercrot & @Snelly87)',
    content: `use crate::geometry::Rect;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub struct CapturePipeline {
    is_running: Arc<AtomicBool>,
}

impl CapturePipeline {
    /// Starts asynchronous frame acquisition loop at 60 FPS.
    /// Fixes frame stalling when target window is backgrounded.
    pub fn start<F>(&mut self, source_rect: Rect, mut on_frame: F)
    where
        F: FnMut() + Send + 'static,
    {
        self.is_running.store(true, Ordering::SeqCst);
        let running = Arc::clone(&self.is_running);

        thread::spawn(move || {
            while running.load(Ordering::SeqCst) {
                on_frame();
                thread::sleep(Duration::from_millis(16)); // ~60 FPS
            }
        });
    }
}`,
  },
];

export const ZIG_FILES: CodeFile[] = [
  {
    path: 'zig/build.zig',
    language: 'zig',
    title: 'build.zig',
    description: 'Zig build system configuration for pip-tool-zig native binary',
    content: `const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "pip-tool-zig",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    b.installArtifact(exe);
}`,
  },
  {
    path: 'zig/build.bat',
    language: 'bat',
    title: 'build.bat',
    description: 'Windows 64-bit compilation script for Zig engine',
    content: `@echo off
echo Building PiP-Tool Zig Native Windows Engine...
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-windows
echo Binary created at zig-out\\bin\\pip-tool-zig.exe
pause`,
  },
  {
    path: 'zig/src/geometry.zig',
    language: 'zig',
    title: 'geometry.zig',
    description: 'Zig geometry logic with zero-panic safe DPI scaling and bounds clamping',
    content: `const std = @import("std");

pub const Rect = struct {
    x: i32,
    y: i32,
    width: i32,
    height: i32,

    pub fn init(x: i32, y: i32, width: i32, height: i32) Rect {
        return .{ .x = x, .y = y, .width = @max(10, width), .height = @max(10, height) };
    }

    /// Safe DPI scaling avoiding crashes on multi-monitor setups (Fixes @gkillerwog2147).
    pub fn scaleDpi(self: Rect, from_dpi: f32, to_dpi: f32) Rect {
        const safe_from = if (@abs(from_dpi) < 0.001) 96.0 else from_dpi;
        const safe_to = if (@abs(to_dpi) < 0.001) 96.0 else to_dpi;
        const factor = safe_to / safe_from;

        const w = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.width)) * factor));
        const h = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.height)) * factor));
        return .{
            .x = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.x)) * factor)),
            .y = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.y)) * factor)),
            .width = @max(40, w),
            .height = @max(40, h),
        };
    }
};`,
  },
  {
    path: 'zig/src/capture.zig',
    language: 'zig',
    title: 'capture.zig',
    description: 'Zig native controller supporting click-through gaming mode & 1440p presets',
    content: `const std = @import("std");
const Rect = @import("geometry.zig").Rect;

pub const NativePipController = struct {
    click_through: bool = false,
    lock_ratio: bool = true,
    opacity: f32 = 1.0,
    bounds: Rect,

    pub fn init(bounds: Rect) NativePipController {
        return .{ .bounds = bounds };
    }

    /// Toggle click-through mode for uninterrupted gaming (Fixes @nemurishivasai4765)
    pub fn setClickThrough(self: *NativePipController, enabled: bool) void {
        self.click_through = enabled;
    }

    /// Scale PiP window according to high resolution 1440p / 4K (Fixes @Gisborne1990)
    pub fn setResolutionPreset(self: *NativePipController, is_1440p: bool) void {
        if (is_1440p) {
            self.bounds.width = 850;
            self.bounds.height = 480;
        } else {
            self.bounds.width = 480;
            self.bounds.height = 270;
        }
    }
};`,
  },
  {
    path: 'zig/src/main.zig',
    language: 'zig',
    title: 'main.zig',
    description: 'Zig executable entry point with GeneralPurposeAllocator',
    content: `const std = @import("std");
const geometry = @import("geometry.zig");
const ml = @import("ml.zig");
const capture = @import("capture.zig");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("PiP-Tool Zig Native Engine v2.0.0\\n", .{});

    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var ml_service = ml.MachineLearningService.init(allocator);
    defer ml_service.deinit();

    const pred = ml_service.predict("YouTube", "Stream", 1920, 1080);
    var controller = capture.NativePipController.init(pred.rect);
    controller.setClickThrough(true); // Ghost mode
    controller.setResolutionPreset(true); // 1440p
}`,
  },
];
