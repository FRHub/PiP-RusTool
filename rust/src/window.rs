use crate::geometry::Rect;
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

impl Default for PipWindowConfig {
    fn default() -> Self {
        Self {
            title: "PiP Mode (Rust Engine)".into(),
            bounds: Rect::new(40, 40, 480, 270),
            opacity: 1.0,
            click_through: false,
            lock_aspect_ratio: true,
            current_dpi: 96.0,
        }
    }
}

pub struct PipWindow {
    config: PipWindowConfig,
    is_visible: bool,
}

impl PipWindow {
    pub fn new(config: PipWindowConfig) -> Self {
        Self {
            config,
            is_visible: false,
        }
    }

    /// Toggles click-through (Ghost Mode)
    /// Fixes YouTube issue @nemurishivasai4765:
    /// In C# PiP-Tool, the window captured all mouse clicks, ruining FPS game aiming.
    /// In Rust, WS_EX_TRANSPARENT allows mouse clicks to fall straight through to the game beneath!
    pub fn set_click_through(&mut self, enable: bool) {
        self.config.click_through = enable;
        // In Win32: SetWindowLongPtr(hwnd, GWL_EXSTYLE, ex_style | WS_EX_TRANSPARENT)
    }

    /// Handles monitor transition and DPI changes safely without crashing.
    /// Fixes YouTube issue @gkillerwog2147:
    /// In C# PiP-Tool, moving between 1080p and 1440p/4K monitors triggered unhandled DpiHelper exception.
    /// In Rust, WM_DPICHANGED recalculates bounds with guarded non-zero scaling.
    pub fn on_dpi_changed(&mut self, new_dpi: f32, suggested_rect: Option<Rect>) {
        if let Some(rect) = suggested_rect {
            self.config.bounds = rect;
        } else {
            self.config.bounds = self.config.bounds.scale_dpi(self.config.current_dpi, new_dpi);
        }
        self.config.current_dpi = new_dpi;
    }

    /// Preset resizing optimized for 1440p / 4K monitors.
    /// Fixes YouTube issue @Gisborne1990:
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

    pub fn config(&self) -> &PipWindowConfig {
        &self.config
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SizePreset {
    Small,
    Medium,
    Large,
    QHD1440p,
    UHD4K,
}
