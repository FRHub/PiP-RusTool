use crate::geometry::Rect;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingSample {
    pub region: String, // "top left height width"
    pub program: String,
    pub window_title: String,
    pub window_top: i32,
    pub window_left: i32,
    pub window_height: i32,
    pub window_width: i32,
    pub timestamp: u64,
    #[serde(default)]
    pub is_favorite: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionResult {
    pub rect: Rect,
    pub confidence: f32,
    pub tag: String,
}

pub struct MachineLearningPredictor {
    data_path: PathBuf,
    samples: Vec<TrainingSample>,
}

impl MachineLearningPredictor {
    pub fn new<P: AsRef<Path>>(data_path: P) -> Self {
        let mut predictor = Self {
            data_path: data_path.as_ref().to_path_buf(),
            samples: Vec::new(),
        };
        predictor.load_data();
        predictor
    }

    pub fn load_data(&mut self) {
        if self.data_path.exists() {
            if let Ok(content) = fs::read_to_string(&self.data_path) {
                if let Ok(loaded) = serde_json::from_str::<Vec<TrainingSample>>(&content) {
                    self.samples = loaded;
                    return;
                }
            }
        }
        self.init_defaults();
    }

    fn init_defaults(&mut self) {
        self.samples = vec![
            TrainingSample {
                region: "40 80 540 960".into(),
                program: "YouTube".into(),
                window_title: "YouTube Video Stream".into(),
                window_top: 0,
                window_left: 0,
                window_height: 720,
                window_width: 1280,
                timestamp: 0,
            },
            TrainingSample {
                region: "35 48 580 820".into(),
                program: "Code".into(),
                window_title: "VS Code Editor".into(),
                window_top: 0,
                window_left: 0,
                window_height: 720,
                window_width: 1280,
                timestamp: 0,
            },
        ];
        let _ = self.save_data();
    }

    pub fn save_data(&self) -> Result<(), std::io::Error> {
        if let Some(parent) = self.data_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let serialized = serde_json::to_string_pretty(&self.samples)?;
        fs::write(&self.data_path, serialized)?;
        Ok(())
    }

    pub fn add_sample(
        &mut self,
        rect: Rect,
        program: &str,
        window_title: &str,
        win_w: i32,
        win_h: i32,
    ) {
        let region_str = format!("{} {} {} {}", rect.y, rect.x, rect.height, rect.width);
        self.samples.insert(
            0,
            TrainingSample {
                region: region_str,
                program: program.to_string(),
                window_title: window_title.to_string(),
                window_top: 0,
                window_left: 0,
                window_height: win_h,
                window_width: win_w,
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
            },
        );
        if self.samples.len() > 100 {
            self.samples.truncate(100);
        }
        let _ = self.save_data();
    }

    pub fn toggle_favorite(
        &mut self,
        rect: Rect,
        program: &str,
        window_title: &str,
        win_w: i32,
        win_h: i32,
    ) -> bool {
        let p_lower = program.to_lowercase();
        if let Some(pos) = self
            .samples
            .iter()
            .position(|s| s.is_favorite && s.program.to_lowercase() == p_lower)
        {
            self.samples.remove(pos);
            let _ = self.save_data();
            false
        } else {
            let region_str = format!("{} {} {} {}", rect.y, rect.x, rect.height, rect.width);
            self.samples.insert(
                0,
                TrainingSample {
                    region: region_str,
                    program: program.to_string(),
                    window_title: window_title.to_string(),
                    window_top: 0,
                    window_left: 0,
                    window_height: win_h,
                    window_width: win_w,
                    timestamp: std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs(),
                    is_favorite: true,
                },
            );
            let _ = self.save_data();
            true
        }
    }

    /// Predict optimal crop region given target window program and dimensions
    pub fn predict(&self, program: &str, window_title: &str, win_w: i32, win_h: i32) -> PredictionResult {
        let p_lower = program.to_lowercase();
        let t_lower = window_title.to_lowercase();

        // 1. Check user-saved favorite first
        if let Some(fav) = self
            .samples
            .iter()
            .find(|s| s.is_favorite && s.program.to_lowercase() == p_lower)
        {
            let parts: Vec<i32> = fav
                .region
                .split_whitespace()
                .filter_map(|s| s.parse().ok())
                .collect();
            if parts.len() == 4 {
                let (top, left, height, width) = (parts[0], parts[1], parts[2], parts[3]);
                let scale_x = win_w as f32 / fav.window_width.max(1) as f32;
                let scale_y = win_h as f32 / fav.window_height.max(1) as f32;

                return PredictionResult {
                    rect: Rect::new(
                        (left as f32 * scale_x).round() as i32,
                        (top as f32 * scale_y).round() as i32,
                        (width as f32 * scale_x).round() as i32,
                        (height as f32 * scale_y).round() as i32,
                    ),
                    confidence: 1.0,
                    tag: format!("Favorite: {}", fav.program),
                };
            }
        }

        let mut best_match = None;
        let mut max_score = 0;

        for sample in &self.samples {
            let mut score = 0;
            let sp_lower = sample.program.to_lowercase();
            let st_lower = sample.window_title.to_lowercase();

            if sp_lower == p_lower {
                score += 50;
            } else if sp_lower.contains(&p_lower) || p_lower.contains(&sp_lower) {
                score += 30;
            }

            for token in t_lower.split_whitespace() {
                if token.len() > 2 && st_lower.contains(token) {
                    score += 15;
                }
            }

            if score > max_score {
                max_score = score;
                best_match = Some(sample);
            }
        }

        if let Some(matched) = best_match {
            let parts: Vec<i32> = matched
                .region
                .split_whitespace()
                .filter_map(|s| s.parse().ok())
                .collect();
            if parts.len() == 4 {
                let (top, left, height, width) = (parts[0], parts[1], parts[2], parts[3]);
                let scale_x = win_w as f32 / matched.window_width.max(1) as f32;
                let scale_y = win_h as f32 / matched.window_height.max(1) as f32;

                let rect = Rect::new(
                    (left as f32 * scale_x).round() as i32,
                    (top as f32 * scale_y).round() as i32,
                    (width as f32 * scale_x).round() as i32,
                    (height as f32 * scale_y).round() as i32,
                );

                return PredictionResult {
                    rect,
                    confidence: (0.6 + (max_score as f32 / 120.0)).min(0.99),
                    tag: format!("ML Match: {}", matched.program),
                };
            }
        }

        // Fallback default: 16:9 center region
        let w = (win_w as f32 * 0.75).round() as i32;
        let h = ((w as f32) * (9.0 / 16.0)).round() as i32;
        let x = (win_w - w) / 2;
        let y = (win_h - h) / 2;

        PredictionResult {
            rect: Rect::new(x, y, w, h),
            confidence: 0.70,
            tag: "Default Heuristic 16:9".into(),
        }
    }
}
