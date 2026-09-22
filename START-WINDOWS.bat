@echo off
title Biomolecule Toxicity Detective
cd /d "%~dp0"

echo.
echo   BIOMOLECULE TOXICITY DETECTIVE
echo   ==============================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   Node.js is not installed on this computer.
  echo.
  echo   Download it from https://nodejs.org  ^(pick the LTS button^),
  echo   run the installer, then double-click this file again.
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODEVER=%%v
echo   Node %NODEVER% found.
echo.

if not exist node_modules (
  echo   First run - installing dependencies. This takes about a minute.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   Install failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
  echo.
)

echo   Building the site and starting the server...
echo.
echo   When you see "listening on http://localhost:4000" below,
echo   the site is live. Your browser should open by itself.
echo.
echo   To stop the server: press Ctrl+C, or just close this window.
echo.

start "" cmd /c "timeout /t 8 >nul && start http://localhost:4000"
call npm run preview

echo.
echo   Server stopped.
pause
