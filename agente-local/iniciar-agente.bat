@echo off
rem Agente de descarga - Comparte tu Gato
rem Doble clic para arrancarlo; cerrar la ventana (o Ctrl+C) para detenerlo.
cd /d "%~dp0"
echo ============================================
echo   Agente Comparte tu Gato
echo   Las fotos aparecen en: %~dp0fotos_td
echo   Cierra esta ventana para detener el agente
echo ============================================
npm start
pause
