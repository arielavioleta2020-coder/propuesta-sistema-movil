@echo off
title StockMobile - Back-End (API)
echo ============================================
echo  StockMobile - Servidor Back-End Node.js
echo ============================================
echo.
echo Requiere que XAMPP (MySQL) este activo.
echo.
cd /d "%~dp0backend"
npm start
echo.
echo El servidor se cerro. Puede cerrar esta ventana.
pause