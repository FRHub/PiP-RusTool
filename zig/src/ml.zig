const std = @import("std");
const Rect = @import("geometry.zig").Rect;

pub const Prediction = struct {
    rect: Rect,
    confidence: f32,
    tag: []const u8,
};

pub const Sample = struct {
    region: Rect,
    program: []const u8,
    title: []const u8,
};

pub const MachineLearningService = struct {
    allocator: std.mem.Allocator,
    samples: std.ArrayList(Sample),

    pub fn init(allocator: std.mem.Allocator) MachineLearningService {
        return .{
            .allocator = allocator,
            .samples = std.ArrayList(Sample).init(allocator),
        };
    }

    pub fn deinit(self: *MachineLearningService) void {
        self.samples.deinit();
    }

    pub fn addSample(self: *MachineLearningService, rect: Rect, program: []const u8, title: []const u8) !void {
        try self.samples.append(.{
            .region = rect,
            .program = program,
            .title = title,
        });
    }

    pub fn predict(self: *MachineLearningService, program: []const u8, title: []const u8, win_w: i32, win_h: i32) Prediction {
        _ = title;
        // Search matching program in history
        for (self.samples.items) |s| {
            if (std.mem.eql(u8, s.program, program)) {
                return .{
                    .rect = s.region,
                    .confidence = 0.95,
                    .tag = "Zig ML: Program Match",
                };
            }
        }

        // Fast heuristic default (16:9 center crop)
        const w = @as(i32, @intFromFloat(@as(f32, @floatFromInt(win_w)) * 0.75));
        const h = @as(i32, @intFromFloat(@as(f32, @floatFromInt(w)) * (9.0 / 16.0)));
        const x = @divTrunc(win_w - w, 2);
        const y = @divTrunc(win_h - h, 2);

        return .{
            .rect = Rect.init(x, y, w, h),
            .confidence = 0.75,
            .tag = "Zig ML: 16:9 Heuristic",
        };
    }
};
