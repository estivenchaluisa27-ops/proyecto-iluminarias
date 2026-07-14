@echo off
REM Acceso directo para reiniciar Open Design Daemon
REM Doble-click para ejecutar

powershell.exe -ExecutionPolicy Bypass -File "%~dp0restart-open-design.ps1"