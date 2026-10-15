use pip_tool_rs::geometry::Rect;
use pip_tool_rs::ml::MachineLearningPredictor;
use pip_tool_rs::window::{PipWindow, PipWindowConfig, SizePreset};

fn main() {
    env_logger::init();
    println!("==================================================");
    println!("  PiP-Tool Rust Native Engine v2.0.0");
    println!("  High-Performance, Memory-Safe Screen Cropper");
    println!("==================================================");

    // Initialize ML predictor
    let mut ml = MachineLearningPredictor::new("data/ml_model.json");
    let prediction = ml.predict("YouTube", "Lofi Beats Live Stream", 1920, 1080);
    println!("[ML Engine] Prediction result: {:?}", prediction);

    // Configure window with solutions for reported YouTube issues:
    // 1. Ghost mode (click-through) for FPS games (@nemurishivasai4765)
    // 2. Safe multi-monitor DPI scaling (@gkillerwog2147)
    // 3. 1440p / 4K size preset (@Gisborne1990)
    let config = PipWindowConfig {
        title: "PiP Window (Rust Engine)".into(),
        bounds: prediction.rect,
        opacity: 0.95,
        click_through: true, // Ghost mode enabled!
        lock_aspect_ratio: true,
        current_dpi: 96.0,
    };

    let mut pip = PipWindow::new(config);
    println!("[Window Engine] Created PiP window with click-through enabled.");

    // Scale up for 1440p monitor safely
    pip.apply_size_preset(SizePreset::QHD1440p);
    println!("[Window Engine] Sized for 1440p: {}x{}", pip.config().bounds.width, pip.config().bounds.height);

    // Record training sample
    ml.add_sample(Rect::new(100, 100, 640, 360), "YouTube", "Lofi Beats Live Stream", 1920, 1080);
    println!("[ML Engine] Recorded sample and updated weights.");
}
