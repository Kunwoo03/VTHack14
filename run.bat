@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Launching HokieTutor Web Application (VT Hacks)
echo ========================================================
echo.

if not exist "%~dp0index.html" (
    echo [ERROR] index.html was not found in this folder!
    echo If you are running this from inside a ZIP file, please click
    echo "Extract All" first, and then run run.bat from the extracted folder.
    echo.
    pause
    exit /b 1
)

echo Opening HokieTutor in your default web browser...

:: Method 1: Try Python webbrowser module (most reliable on Windows)
python -m webbrowser "%~dp0index.html" >nul 2>&1
if %errorlevel% equ 0 goto success

:: Method 2: Standard Windows start command with proper empty title string
start "" "%~dp0index.html" >nul 2>&1
if %errorlevel% equ 0 goto success

:: Method 3: Windows Explorer shell launch fallback
explorer.exe "%~dp0index.html" >nul 2>&1
if %errorlevel% equ 0 goto success

echo [WARNING] Could not automatically trigger your browser.
echo Please manually double-click: index.html or standalone-app.html
echo.
pause
exit /b 1

:success
echo.
echo [SUCCESS] HokieTutor opened in your browser!
echo.
exit /b 0
