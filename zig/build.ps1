# Windows PowerShell Build Script for PiP-Tool Zig Engine
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  Building PiP-Tool Zig Native Windows Engine (64-bit)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

if (-not (Get-Command zig -ErrorAction SilentlyContinue)) {
    Write-Error "Zig compiler not found. Please install Zig: https://ziglang.org"
    exit 1
}

Write-Host "Running: zig build -Doptimize=ReleaseFast -Dtarget=x86_64-windows" -ForegroundColor Green
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-windows

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Native Windows executable compiled: .\zig-out\bin\pip-tool-zig.exe" -ForegroundColor Green
} else {
    Write-Error "Zig build failed with code $LASTEXITCODE"
}
