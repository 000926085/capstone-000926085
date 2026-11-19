@echo off
start "Frontend" /d "%~dp0frontend" cmd /k "npm run dev"
start "Backend" /d "%~dp0backend" cmd /k "uvicorn routes:app --reload"