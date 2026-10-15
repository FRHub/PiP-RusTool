@echo off
echo ========================================================
echo   Building PiP-Tool Zig Native Windows Engine
echo ========================================================
where zig >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Zig compiler not found. Download Zig from https://ziglang.org/download/
    exit /b 1
)

echo Compiling native Windows binary: zig build -Doptimize=ReleaseFast -Dtarget=x86_64-windows
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-windows
if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Binary created at zig-out\bin\pip-tool-zig.exe
)
pause
