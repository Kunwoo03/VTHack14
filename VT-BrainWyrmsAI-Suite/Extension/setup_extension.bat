@echo off
title VT BrainWyrms AI - Chrome Extension Setup
cls
echo ========================================================================
echo                 VT BRAINWYRMS AI - CHROME EXTENSION SETUP
echo ========================================================================
echo.
echo Extension Location:
echo %~dp0
echo.
echo How to Load into Chrome, Edge, or Brave in 10 seconds:
echo   1. Open your browser and navigate to: chrome://extensions
echo   2. Toggle ON "Developer mode" in the top-right corner.
echo   3. Click the "Load unpacked" button in the top-left.
echo   4. Select THIS folder:
echo      %~dp0
echo.
echo ------------------------------------------------------------------------
echo [?] Next Actions:
echo ------------------------------------------------------------------------
echo   [A] Launch Web Application (VT-BrainWyrmsAI.html)
echo   [C] Open Chrome Extensions page in browser
echo   [Enter] Close this window
echo.
set /p choice="Selection [A, C, or Enter]: "
if /i "%choice%"=="A" (
    start "" "%~dp0..\Application\run_app.bat"
)
if /i "%choice%"=="C" (
    start "" "chrome://extensions"
)
