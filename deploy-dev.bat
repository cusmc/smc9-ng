@echo off
setlocal

set DEPLOY_PATH=j:\studentPortalDev

echo ==========================================
echo  CUSMC Student Portal - DEVELOPMENT Build
echo ==========================================
echo.

echo [1/2] Building development bundle (staging backend)...
call ng build --configuration=development
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Build failed. Deployment aborted.
  exit /b %errorlevel%
)

echo.
echo [2/2] Deploying to %DEPLOY_PATH% ...
if not exist "%DEPLOY_PATH%" (
  echo ERROR: Deploy path %DEPLOY_PATH% not found. Is the network drive mapped?
  exit /b 1
)

robocopy dist\ "%DEPLOY_PATH%" /MIR /NFL /NDL /NJH /NJS
if %errorlevel% gtr 7 (
  echo ERROR: robocopy failed with exit code %errorlevel%
  exit /b %errorlevel%
)

echo.
echo Deployment complete: %DEPLOY_PATH%
endlocal
