# Windows PowerShell Build Script for PiP-Tool Rust Engine
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Building PiP-Tool Rust Native Windows Engine (64-bit)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Error "Cargo not found in PATH. Please install Rust toolchain: https://rustup.rs"
    exit 1
}

Write-Host "Running: cargo build --release" -ForegroundColor Green
cargo build --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Native Windows executable compiled: .\target\release\pip-tool-rs.exe" -ForegroundColor Green
} else {
    Write-Error "Build failed with code $LASTEXITCODE"
}
