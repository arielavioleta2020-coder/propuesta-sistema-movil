@echo off
title StockMobile - App Movil (Expo)
echo ============================================
echo  StockMobile - App movil React Native (Expo)
echo ============================================
echo.
echo  PASO IMPORTANTE: cuando aparezca el menu de Expo,
echo  presione la letra  a  para abrir la app en el
echo  emulador Android.
echo.
echo  (O escanee el codigo QR con Expo Go en su celular)
echo.
cd /d "%~dp0mobile"
npx expo start
echo.
echo Expo se cerro. Puede cerrar esta ventana.
pause