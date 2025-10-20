@echo off
echo ================================================
echo STOK YONETIM SISTEMI DURDURULUYOR...
echo ================================================
echo.

:: Node.js process'lerini durdur
taskkill /F /IM node.exe /T 2>nul

echo.
echo Sistem durduruldu.
echo.
pause

