@echo off
title BuildYourHome Admin - local only (127.0.0.1:5050)
cd /d "%~dp0"
echo.
echo   BuildYourHome Admin - starting local-only server on http://127.0.0.1:5050
echo   This is bound to 127.0.0.1 (loopback) so it is hidden from the Wi-Fi network.
echo.
start "" http://127.0.0.1:5050
node server.mjs
pause
