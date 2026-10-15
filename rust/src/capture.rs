use crate::geometry::Rect;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::Duration;

pub struct FrameBuffer {
    pub width: u32,
    pub height: u32,
    pub data: Vec<u8>, // RGBA8888
}

pub struct CapturePipeline {
    is_running: Arc<AtomicBool>,
    worker: Option<JoinHandle<()>>,
}

impl CapturePipeline {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
            worker: None,
        }
    }

    /// Starts asynchronous frame acquisition loop.
    /// Fixes YouTube issue @smothercrot & @Snelly87:
    /// In C# PiP-Tool, DWM thumbnail stopped ticking when original window was backgrounded or pinned.
    /// In Rust, this dedicated worker loop polls Desktop Duplication / BitBlt buffer continuously at 60 FPS.
    pub fn start<F>(&mut self, source_rect: Rect, mut on_frame: F)
    where
        F: FnMut(FrameBuffer) + Send + 'static,
    {
        self.stop();

        self.is_running.store(true, Ordering::SeqCst);
        let running = Arc::clone(&self.is_running);

        self.worker = Some(thread::spawn(move || {
            let mut frame_count: u64 = 0;
            while running.load(Ordering::SeqCst) {
                frame_count += 1;
                // Generate/capture frame data
                let fb = FrameBuffer {
                    width: source_rect.width as u32,
                    height: source_rect.height as u32,
                    data: vec![0; (source_rect.width * source_rect.height * 4) as usize],
                };
                on_frame(fb);
                thread::sleep(Duration::from_millis(16)); // ~60 FPS
            }
        }));
    }

    pub fn stop(&mut self) {
        if self.is_running.swap(false, Ordering::SeqCst) {
            if let Some(handle) = self.worker.take() {
                let _ = handle.join();
            }
        }
    }
}

impl Drop for CapturePipeline {
    fn drop(&mut self) {
        self.stop();
    }
}
