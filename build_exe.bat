@echo off
cd /d "%~dp0"
python -m pip install -r requirements.txt
pyinstaller --onefile --windowed --add-data "index.html;." --add-data "styles.css;." --add-data "script.js;." --add-data "config.json;." --add-data "public_data.json;." app.py
pause
