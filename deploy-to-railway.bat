@echo off
echo ========================================
echo Railway Deployment - Git Push Script
echo ========================================
echo.

echo Adding all changes to git...
git add .

echo.
echo Committing changes...
git commit -m "Add Railway deployment configuration - Fix hosting issues"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Git push completed!
echo ========================================
echo.
echo Next steps:
echo 1. Go to railway.app
echo 2. Login with GitHub
echo 3. Create new project from your GitHub repo
echo 4. Add MySQL database
echo 5. Set environment variables
echo.
echo See RAILWAY-DEPLOYMENT-GUIDE.md for detailed instructions
echo ========================================
pause
