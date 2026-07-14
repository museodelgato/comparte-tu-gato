@echo off
rem Reinicio TOTAL - Comparte tu Gato
rem 1) Vacia las fotos del bucket en la nube (aprobadas/)
rem 2) Borra las fotos locales de fotos_td
rem 3) Borra la memoria del agente (estado.json)
rem La numeracion vuelve a empezar en gato_001.jpg.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo FALTA NODE.JS: instalalo desde https://nodejs.org y vuelve a intentar.
  pause
  exit /b 1
)
if not exist ".env" (
  echo FALTA EL ARCHIVO .env con las llaves. No se puede vaciar el bucket sin el.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Falta instalar dependencias: abre primero iniciar-agente.bat una vez.
  pause
  exit /b 1
)

echo ============================================
echo   REINICIO TOTAL de la exhibicion
echo ============================================
echo.
echo Esto BORRA (y NO se puede recuperar):
echo   1. Todas las fotos del bucket en la nube
echo   2. Todas las fotos locales de fotos_td
echo   3. La memoria del agente (estado.json)
echo.
echo La numeracion vuelve a empezar en gato_001.jpg.
echo.
echo IMPORTANTE: cierra primero la ventana del agente
echo (iniciar-agente.bat) si esta corriendo.
echo.
set /p RESP=Escribe SI y presiona Enter para el reinicio total (otra cosa cancela):
if /i not "%RESP%"=="SI" (
  echo.
  echo Cancelado: no se borro nada.
  goto :fin
)
echo.
echo [1/2] Vaciando el bucket en la nube...
node --env-file=.env vaciar-bucket.js
if errorlevel 1 (
  echo.
  echo ERROR: no se pudo vaciar el bucket. NO se borro nada local.
  echo Revisa la conexion a internet y el archivo .env, y vuelve a intentar.
  goto :fin
)
echo.
echo [2/2] Borrando fotos locales y reiniciando numeracion...
del /q "fotos_td\gato_*.jpg" 2>nul
del /q "fotos_td\gato_*.jpg.tmp" 2>nul
del /q "estado.json" 2>nul
echo.
echo Listo: reinicio total completado.
echo La siguiente foto sera gato_001.jpg.
:fin
echo.
pause
