@echo off
start "" /b node node_modules\vite\bin\vite.js --port 5173 --host > vite-dev.log 2>&1
exit /b 0
