@echo off
title StockMobile - Emulador Android
echo ============================================
echo  Iniciando emulador Android (Pixel_7)
echo  Cierre esta ventana cuando termine la demo.
echo ============================================
echo.
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_7
pause