const std = @import("std");
const geometry = @import("geometry.zig");
const ml = @import("ml.zig");
const capture = @import("capture.zig");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("==================================================\n", .{});
    try stdout.print("  PiP-Tool Zig Native Engine v2.0.0\n", .{});
    try stdout.print("  Zero-overhead, Manual Memory Management PiP Core\n", .{});
    try stdout.print("==================================================\n", .{});

    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var ml_service = ml.MachineLearningService.init(allocator);
    defer ml_service.deinit();

    // Train initial sample
    try ml_service.addSample(
        geometry.Rect.init(100, 100, 640, 360),
        "YouTube",
        "Lofi Hip Hop Stream",
    );

    const prediction = ml_service.predict("YouTube", "Lofi Hip Hop Stream", 1920, 1080);
    try stdout.print("[Zig ML] Predicted: rect=({}, {}, {}, {}), conf={d:.2}, tag={s}\n", .{
        prediction.rect.x,
        prediction.rect.y,
        prediction.rect.width,
        prediction.rect.height,
        prediction.confidence,
        prediction.tag,
    });

    var controller = capture.NativePipController.init(prediction.rect);
    // Solves YouTube issues:
    // 1. Ghost mode for FPS gamers
    controller.setClickThrough(true);
    try stdout.print("[Zig Controller] Click-through mode: ENABLED (No mouse interference)\n", .{});

    // 2. 1440p HiDPI preset
    controller.setResolutionPreset(true);
    try stdout.print("[Zig Controller] 1440p Scale applied: {}x{}\n", .{ controller.bounds.width, controller.bounds.height });

    // 3. Multi-monitor scale check
    const scaled = controller.bounds.scaleDpi(96.0, 144.0);
    try stdout.print("[Zig Controller] Multi-monitor 1.5x DPI Scaled: {}x{}\n", .{ scaled.width, scaled.height });
}
