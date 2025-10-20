@echo off
title STOK YONETIM SISTEMI
cd /d "%~dp0"

echo ================================================
echo STOK YONETIM SISTEMI BASLATILIYOR...
echo ================================================
echo.
echo Backend ve Frontend baslatiliyor...
echo Lutfen bu pencereyi ACIK BIRAKIN!
echo.
echo Tarayicinizda su adresi acin:
echo http://localhost:3000/install.html
echo.
echo Sistemi durdurmak icin bu pencereyi kapatin.
echo ================================================
echo.

:: Backend'i arka planda başlat
start /B "Backend" cmd /c "cd backend && npm start"

:: 5 saniye bekle
timeout /t 5 /nobreak >nul

:: Frontend'i başlat
cd frontend
call npm start

pause

