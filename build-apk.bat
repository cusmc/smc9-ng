@echo off
setlocal enabledelayedexpansion

set KEYSTORE_FILE=smc9-release.jks
set KEYSTORE_PROPS=android\keystore.properties
set VERSION_PROPS=android\version.properties
set OUT_DIR=dist-mobile

echo ==========================================
echo  CUSMC Canteen Scanner - APK Build
echo ==========================================
echo.

echo [1/5] Building production web bundle...
call ng build --configuration=production
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Angular build failed. Aborting.
  exit /b %errorlevel%
)

echo.
echo [2/5] Syncing Capacitor Android project...
call npx cap sync android
if %errorlevel% neq 0 (
  echo.
  echo ERROR: cap sync failed. Aborting.
  exit /b %errorlevel%
)

echo.
echo [3/5] Checking release keystore...
if exist "%KEYSTORE_PROPS%" (
  echo Keystore already configured, reusing it.
) else (
  echo No release keystore found - creating one now.
  echo.
  set /p KS_ALIAS="Key alias [smc9key]: "
  if "!KS_ALIAS!"=="" set KS_ALIAS=smc9key
  set /p KS_PASSWORD="Choose a keystore/key password: "
  if "!KS_PASSWORD!"=="" (
    echo ERROR: Password cannot be empty. Aborting.
    exit /b 1
  )

  keytool -genkeypair -v ^
    -keystore "android\%KEYSTORE_FILE%" ^
    -alias "!KS_ALIAS!" ^
    -keyalg RSA -keysize 2048 -validity 10000 ^
    -storepass "!KS_PASSWORD!" -keypass "!KS_PASSWORD!" ^
    -dname "CN=CUSMC, OU=IT, O=Cebu United School of Medicine and Colleges, L=Cebu, S=Cebu, C=PH"
  if !errorlevel! neq 0 (
    echo.
    echo ERROR: Keystore generation failed. Aborting.
    exit /b !errorlevel!
  )

  (
    echo storeFile=%KEYSTORE_FILE%
    echo storePassword=!KS_PASSWORD!
    echo keyAlias=!KS_ALIAS!
    echo keyPassword=!KS_PASSWORD!
  ) > "%KEYSTORE_PROPS%"

  echo.
  echo ==========================================================
  echo  IMPORTANT: BACK UP android\%KEYSTORE_FILE% AND YOUR PASSWORD
  echo  NOW, in a password manager or secure network share.
  echo  If this keystore is lost, you can NEVER update this app
  echo  on the Play Store again under the same listing.
  echo ==========================================================
  echo.
)

echo.
echo [4/5] Bumping version code...
powershell -NoProfile -Command ^
  "$p = Get-Content '%VERSION_PROPS%' | ForEach-Object { if ($_ -match '^versionCode=(\d+)') { 'versionCode=' + ([int]$Matches[1] + 1) } else { $_ } }; Set-Content -Path '%VERSION_PROPS%' -Value $p"
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Failed to bump versionCode. Aborting.
  exit /b %errorlevel%
)
for /f "usebackq tokens=1,2 delims==" %%A in ("%VERSION_PROPS%") do (
  if "%%A"=="versionCode" set NEW_VERSION_CODE=%%B
  if "%%A"=="versionName" set NEW_VERSION_NAME=%%B
)
echo Building versionCode=%NEW_VERSION_CODE% versionName=%NEW_VERSION_NAME%

echo.
echo [5/5] Building signed release APK...
if exist "C:\Program Files\Android\Android Studio\jbr" (
  set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
)
pushd android
call .\gradlew.bat assembleRelease
set GRADLE_RESULT=%errorlevel%
popd
if %GRADLE_RESULT% neq 0 (
  echo.
  echo ERROR: gradlew assembleRelease failed. Aborting.
  exit /b %GRADLE_RESULT%
)

if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"
set APK_NAME=smc9-canteen-v%NEW_VERSION_NAME%-%NEW_VERSION_CODE%.apk
copy /y "android\app\build\outputs\apk\release\app-release.apk" "%OUT_DIR%\%APK_NAME%" >nul

echo.
echo Build complete: %OUT_DIR%\%APK_NAME%
echo Install this APK directly on a device, or distribute it for testing outside the Play Store.
endlocal
