@echo off
REM ============================================================
REM  BuildYourHome Admin Dashboard — one-click local launcher
REM  Starts the loopback-only server and opens your browser.
REM  (Nothing is uploaded anywhere; nothing listens on the LAN.)
REM ============================================================
title BuildYourHome Admin (localhost only)
cd /d "%~dp0"

echo.
echo  Starting local dashboard server on 127.0.0.1 ...
echo.

start "" http://127.0.0.1:5050
node server.mjs

pause
