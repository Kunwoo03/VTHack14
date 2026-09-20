@echo off
title VT BrainWyrms AI Suite Launcher
:menu
cls
echo ========================================================================
echo               VT BRAINWYRMS AI (HOKIETUTOR) SUITE LAUNCHPAD
echo ========================================================================
echo.
echo  Please select what you would like to run:
echo.
echo    [1] Launch Web Application (Opens VT-BrainWyrmsAI in default browser)
echo    [2] Setup Chrome Extension (Loads unpacked extension in Chrome/Edge)
echo    [3] Launch BOTH (Starts Web Application + Opens Extension Setup)
echo    [4] Open Interactive Visual Launchpad (START_HERE.html)
echo    [5] Exit
echo.
echo ========================================================================
set /p opt="Enter choice [1-5]: "

if "%opt%"=="1" (
    echo.
    echo [*] Starting Web Application...
    start "" "%~dp0Application\run_app.bat"
    goto end
)
if "%opt%"=="2" (
    echo.
    echo [*] Opening Extension Setup...
    start "" "%~dp0Extension\setup_extension.bat"
    goto end
)
if "%opt%"=="3" (
    echo.
    echo [*] Launching both Application and Extension setup...
    start "" "%~dp0Application\run_app.bat"
    start "" "%~dp0Extension\setup_extension.bat"
    goto end
)
if "%opt%"=="4" (
    echo.
    echo [*] Opening START_HERE.html launchpad...
    start "" "%~dp0START_HERE.html"
    goto end
)
if "%opt%"=="5" (
    goto end
)
echo Invalid option, please try again.
pause
goto menu

:end
