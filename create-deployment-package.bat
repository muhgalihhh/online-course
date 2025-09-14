@echo off
REM Script untuk membuat package deployment ke shared hosting

echo 🚀 Creating deployment package for shared hosting...

REM Set variables
set "PROJECT_NAME=online-course"
set "DEPLOY_FOLDER=%PROJECT_NAME%-deploy"
set "ZIP_NAME=%PROJECT_NAME%-shared-hosting.zip"

REM Clean previous build
if exist "%DEPLOY_FOLDER%" (
    echo 🧹 Cleaning previous build...
    rmdir /s /q "%DEPLOY_FOLDER%"
)

if exist "%ZIP_NAME%" (
    del "%ZIP_NAME%"
)

REM Create deploy folder
echo 📁 Creating deploy folder...
mkdir "%DEPLOY_FOLDER%"

REM Copy necessary files and folders
echo 📦 Copying files...
xcopy /E /I /H /Y app "%DEPLOY_FOLDER%\app"
xcopy /E /I /H /Y bootstrap "%DEPLOY_FOLDER%\bootstrap"
xcopy /E /I /H /Y config "%DEPLOY_FOLDER%\config"
xcopy /E /I /H /Y database "%DEPLOY_FOLDER%\database"
xcopy /E /I /H /Y lang "%DEPLOY_FOLDER%\lang"
xcopy /E /I /H /Y public "%DEPLOY_FOLDER%\public"
xcopy /E /I /H /Y resources "%DEPLOY_FOLDER%\resources"
xcopy /E /I /H /Y routes "%DEPLOY_FOLDER%\routes"
xcopy /E /I /H /Y storage "%DEPLOY_FOLDER%\storage"
xcopy /E /I /H /Y vendor "%DEPLOY_FOLDER%\vendor"

REM Copy root files
copy /Y artisan "%DEPLOY_FOLDER%\"
copy /Y composer.json "%DEPLOY_FOLDER%\"
copy /Y composer.lock "%DEPLOY_FOLDER%\"
copy /Y package.json "%DEPLOY_FOLDER%\"
copy /Y .htaccess "%DEPLOY_FOLDER%\"
copy /Y .env.shared-hosting "%DEPLOY_FOLDER%\.env.example"

REM Copy deployment files
copy /Y deploy-shared-hosting.bat "%DEPLOY_FOLDER%\"
copy /Y DEPLOYMENT-SHARED-HOSTING.md "%DEPLOY_FOLDER%\"

REM Create deployment instructions
echo Creating deployment instructions...
(
echo # 🚀 Deployment Instructions
echo.
echo 1. Extract this zip file to your shared hosting root directory
echo 2. Rename .env.example to .env and configure your settings
echo 3. Run: deploy-shared-hosting.bat or follow manual steps in DEPLOYMENT-SHARED-HOSTING.md
echo 4. Point your domain to the public/ folder
echo.
echo ## Quick Setup Commands:
echo ```
echo php artisan setup:shared-hosting
echo php artisan migrate --force
echo ```
echo.
echo For detailed instructions, see DEPLOYMENT-SHARED-HOSTING.md
) > "%DEPLOY_FOLDER%\README-DEPLOYMENT.md"

REM Set proper permissions for key directories
echo 🔐 Setting permissions...
if exist "%DEPLOY_FOLDER%\storage" (
    attrib -r /s "%DEPLOY_FOLDER%\storage\*"
)
if exist "%DEPLOY_FOLDER%\bootstrap\cache" (
    attrib -r /s "%DEPLOY_FOLDER%\bootstrap\cache\*"
)

REM Create zip file (requires PowerShell)
echo 📦 Creating ZIP package...
powershell -Command "Compress-Archive -Path '%DEPLOY_FOLDER%\*' -DestinationPath '%ZIP_NAME%' -Force"

REM Clean up
rmdir /s /q "%DEPLOY_FOLDER%"

echo ✅ Deployment package created: %ZIP_NAME%
echo.
echo 📋 Next steps:
echo 1. Upload %ZIP_NAME% to your shared hosting
echo 2. Extract it to your hosting root directory
echo 3. Follow instructions in README-DEPLOYMENT.md
echo.
pause
