use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

impl Rect {
    pub fn new(x: i32, y: i32, width: i32, height: i32) -> Self {
        Self {
            x,
            y,
            width: width.max(10),
            height: height.max(10),
        }
    }

    pub fn aspect_ratio(&self) -> f32 {
        if self.height <= 0 {
            1.0
        } else {
            self.width as f32 / self.height as f32
        }
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

    /// Clamp bounding box inside target screen bounds safely.
    pub fn clamp_within(&self, bounds: &Rect) -> Self {
        let w = self.width.min(bounds.width.max(10));
        let h = self.height.min(bounds.height.max(10));
        let max_x = (bounds.x + bounds.width - w).max(bounds.x);
        let max_y = (bounds.y + bounds.height - h).max(bounds.y);
        let x = self.x.clamp(bounds.x, max_x);
        let y = self.y.clamp(bounds.y, max_y);
        Self { x, y, width: w, height: h }
    }
}
