@echo off
echo ========================================
echo GitHub Repository Bağlantı Script'i
echo ========================================
echo.

echo Önce GitHub'da yeni bir repository oluşturmanız gerekiyor:
echo 1. github.com adresine gidin
echo 2. "New repository" oluşturun
echo 3. Repository adı: stok-yonetim-sistemi
echo 4. Public seçin
echo 5. README, .gitignore eklemeyin
echo.

set /p repo_url="GitHub repository URL'inizi girin (https://github.com/USERNAME/REPO.git): "

if "%repo_url%"=="" (
    echo Hata: Repository URL girmediniz!
    pause
    exit /b 1
)

echo.
echo Repository URL: %repo_url%
echo.

echo Remote origin ekleniyor...
git remote add origin %repo_url%

echo.
echo Branch'i main olarak ayarlıyor...
git branch -M main

echo.
echo GitHub'a push ediliyor...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo ✅ BAŞARILI! GitHub'a yükleme tamamlandı!
    echo ========================================
    echo.
    echo Sonraki adımlar:
    echo 1. GitHub repository sayfanızı kontrol edin
    echo 2. railway.app adresine gidin
    echo 3. "New Project" - "Deploy from GitHub repo" seçin
    echo 4. Repository'nizi seçin
    echo 5. MySQL database ekleyin
    echo.
    echo Detaylı rehber: RAILWAY-DEPLOYMENT-GUIDE.md
) else (
    echo ========================================
    echo ❌ HATA! Push işlemi başarısız oldu
    echo ========================================
    echo.
    echo Olası sebepler:
    echo - Repository URL yanlış
    echo - GitHub authentication gerekli
    echo - Repository zaten var
    echo.
    echo Manuel olarak deneyin:
    echo git remote add origin %repo_url%
    echo git branch -M main
    echo git push -u origin main
)

echo.
echo ========================================
pause
