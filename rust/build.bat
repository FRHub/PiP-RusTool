@echo off
echo ========================================================
echo   Building PiP-Tool Rust Native Windows Engine
echo ========================================================
where cargo >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Cargo not found. Please install Rust from https://rustup.rs
    exit /b 1
)

echo Compiling release binary for Windows (x86_64-pc-windows-msvc)...
cargo build --release --target x86_64-pc-windows-msvc
if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Binary created at target\x86_64-pc-windows-msvc\release\pip-tool-rs.exe
) else (
    echo [FALLBACK] Compiling default host target...
    cargo build --release
)
pause
