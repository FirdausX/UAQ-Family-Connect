@echo off
title UAQ Family Connect - Cuba dulu
cd /d "%~dp0"
echo ================================================
echo   UAQ Family Connect - CUBA DULU (belum live)
echo ================================================
echo.
echo [1/2] Pasang komponen... (kali pertama boleh ambil 2-5 minit)
call npm install
if errorlevel 1 goto gagal
echo.
echo [2/2] Bina app...
call npm run build
if errorlevel 1 goto gagal
echo.
echo SIAP. Browser akan buka. Login dan cuba app.
echo Tutup tingkap hitam ini bila dah selesai cuba.
start "" http://localhost:4173
call npm run preview
goto tamat
:gagal
echo.
echo *** ADA MASALAH. Screenshot tingkap ini dan hantar kepada Claude. ***
:tamat
pause
