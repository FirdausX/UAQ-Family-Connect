@echo off
title UAQ Family Connect - Livekan
cd /d "%~dp0"
echo ================================================
echo   UAQ Family Connect - LIVEKAN
echo   family.uaqelderlycarecentre.com
echo ================================================
echo.
echo Pastikan anda sudah jalankan 1-CUBA-DULU.bat dan semua OK.
choice /M "Teruskan livekan sekarang"
if errorlevel 2 goto tamat
call npm run build
if errorlevel 1 goto gagal
echo.
echo Menghantar ke Cloudflare... (jika browser buka minta login Cloudflare, login dan tekan Allow)
call npx wrangler deploy
if errorlevel 1 goto gagal
echo.
echo ===== BERJAYA. Family Connect versi baru sudah LIVE. =====
goto tamat
:gagal
echo.
echo *** ADA MASALAH. Versi lama masih live, tiada apa rosak. ***
echo *** Screenshot tingkap ini dan hantar kepada Claude.      ***
:tamat
pause
