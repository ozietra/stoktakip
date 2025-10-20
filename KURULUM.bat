@echo off
echo ================================================
echo STOK YONETIM SISTEMI - KURULUM
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] Backend paketleri yukleniyor...
cd backend
call npm install
if errorlevel 1 (
    echo HATA: Backend paketleri yuklenemedi!
    pause
    exit /b 1
)

echo.
echo [2/4] Frontend paketleri yukleniyor...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo HATA: Frontend paketleri yuklenemedi!
    pause
    exit /b 1
)

echo.
echo ================================================
echo KURULUM TAMAMLANDI!
echo ================================================
echo.
echo Simdi "BASLAT.bat" dosyasina cift tiklayin.
echo.
pause

