@echo off
start "Backend" cmd /k "cd /d S:\WORK\PROJECT\visionai-main && venv\Scripts\activate && uvicorn main:app --reload"
timeout /t 3
start "Frontend" cmd /k "cd /d S:\WORK\PROJECT\visionai-main\frontend && npm run dev"
