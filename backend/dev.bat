@echo off
REM Development server startup script for Windows
REM Usage: dev.bat

call venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 8000
