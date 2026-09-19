@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   HokieTutor Local Web Server (http://localhost:8000)
echo ========================================================
echo.
echo Starting local Python web server...
echo Press Ctrl+C at any time to stop the server.
echo.

:: Automatically open browser after 1 second delay in background
start "" "http://localhost:8000"

:: Start the Python HTTP server
python -m http.server 8000

pause
