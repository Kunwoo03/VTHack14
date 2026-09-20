@echo off
title VT BrainWyrms AI - Application Launcher
cls
echo ========================================================================
echo                 VT BRAINWYRMS AI - APPLICATION LAUNCHER
echo ========================================================================
echo.
echo [*] Launching VT BrainWyrms AI in your default web browser...
start "" "%~dp0VT-BrainWyrmsAI.html"
echo [OK] Application successfully opened!
echo.
echo ------------------------------------------------------------------------
echo [?] TIP: Want to sync live courses directly from Virginia Tech Canvas?
echo ------------------------------------------------------------------------
echo     Press [E] to open the Chrome Extension setup guide.
echo     Press any other key (or press Enter) to finish.
echo.
set /p choice="Selection [E or Enter]: "
if /i "%choice%"=="E" (
    start "" "%~dp0..\Extension\setup_extension.bat"
)
