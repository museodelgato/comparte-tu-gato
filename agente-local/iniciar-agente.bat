@echo off
rem Agente de descarga - Comparte tu Gato
rem Doble clic para arrancarlo; cerrar la ventana (o Ctrl+C) para detenerlo.
rem La primera vez instala solo sus dependencias (necesita internet).
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto :sinnode
if not exist ".env" goto :sinenv
if not exist "node_modules" goto :instalar
goto :arrancar

:sinnode
echo ============================================
echo   FALTA NODE.JS
echo ============================================
echo Instalalo desde https://nodejs.org
echo con el boton verde LTS y Siguiente a todo.
echo Al terminar, vuelve a abrir este archivo.
echo.
pause
exit /b 1

:sinenv
echo ============================================
echo   FALTA EL ARCHIVO .env
echo ============================================
echo Esta carpeta debe traer un archivo llamado .env
echo con las llaves de AWS. Si no lo tienes, copia
echo .env.example como .env y pide las llaves.
echo.
pause
exit /b 1

:instalar
echo Primera vez en esta computadora: instalando dependencias...
call npm install
if errorlevel 1 goto :errorinstalar
goto :arrancar

:errorinstalar
echo.
echo ERROR al instalar. Revisa que haya internet y vuelve a intentar.
pause
exit /b 1

:arrancar
echo ============================================
echo   Agente Comparte tu Gato
echo   Las fotos aparecen en: %~dp0fotos_td
echo   Cierra esta ventana para detener el agente
echo ============================================
call npm start
pause
