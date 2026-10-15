const std = @import("std");
const Rect = @import("geometry.zig").Rect;

pub const FrameBuffer = struct {
    width: u32,
    height: u32,
    pixels: []u8,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, width: u32, height: u32) !FrameBuffer {
        const size = width * height * 4;
        const buf = try allocator.alloc(u8, size);
        @memset(buf, 0);
        return .{
            .width = width,
            .height = height,
            .pixels = buf,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *FrameBuffer) void {
        self.allocator.free(self.pixels);
    }
};

pub const NativePipController = struct {
    click_through: bool = false,
    lock_ratio: bool = true,
    opacity: f32 = 1.0,
    current_dpi: f32 = 96.0,
    bounds: Rect,

    pub fn init(bounds: Rect) NativePipController {
        return .{
            .bounds = bounds,
        };
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
};
