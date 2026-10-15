const std = @import("std");

pub const Rect = struct {
    x: i32,
    y: i32,
    width: i32,
    height: i32,

    pub fn init(x: i32, y: i32, width: i32, height: i32) Rect {
        return .{
            .x = x,
            .y = y,
            .width = @max(10, width),
            .height = @max(10, height),
        };
    }

    pub fn aspectRatio(self: Rect) f32 {
        if (self.height <= 0) return 1.0;
        return @as(f32, @floatFromInt(self.width)) / @as(f32, @floatFromInt(self.height));
    }

    /// Safe DPI scaling avoiding crashes on multi-monitor setups (Fixes @gkillerwog2147).
    pub fn scaleDpi(self: Rect, from_dpi: f32, to_dpi: f32) Rect {
        const safe_from = if (@abs(from_dpi) < 0.001) 96.0 else from_dpi;
        const safe_to = if (@abs(to_dpi) < 0.001) 96.0 else to_dpi;
        const factor = safe_to / safe_from;

        const w = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.width)) * factor));
        const h = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.height)) * factor));
        const x = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.x)) * factor));
        const y = @as(i32, @intFromFloat(@as(f32, @floatFromInt(self.y)) * factor));

        return .{
            .x = x,
            .y = y,
            .width = @max(40, w),
            .height = @max(40, h),
        };
    }

    pub fn clampWithin(self: Rect, bounds: Rect) Rect {
        const w = @min(self.width, bounds.width);
        const h = @min(self.height, bounds.height);
        const x = std.math.clamp(self.x, bounds.x, bounds.x + bounds.width - w);
        const y = std.math.clamp(self.y, bounds.y, bounds.y + bounds.height - h);
        return .{ .x = x, .y = y, .width = w, .height = h };
    }
};
