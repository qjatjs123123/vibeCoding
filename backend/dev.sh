#!/bin/bash
# Development server startup script
# Usage: ./dev.sh

uvicorn app.main:app --reload --port 8000
