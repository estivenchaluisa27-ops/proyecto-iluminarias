# Script para reiniciar el daemon de Open Design
# Uso: .\restart-open-design.ps1

Write-Host "=== Open Design Daemon Restarter ===" -ForegroundColor Cyan

# Verificar si está corriendo
Write-Host "Verificando estado del daemon..." -NoNewline
$daemonRunning = Test-NetConnection -ComputerName 127.0.0.1 -Port 7456 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($daemonRunning) {
    Write-Host " ✅ YA ESTÁ CORRIENDO" -ForegroundColor Green
    Write-Host ""
    Write-Host "El daemon ya está activo en http://127.0.0.1:7456" -ForegroundColor Yellow
    Write-Host "¿Quieres reiniciarlo de todas formas? (S/N): " -NoNewline
    $response = Read-Host
    if ($response -ne 'S' -and $response -ne 's') {
        Write-Host "Operación cancelada." -ForegroundColor Gray
        exit 0
    }
    
    # Detener daemon existente
    Write-Host "Deteniendo daemon existente..." -NoNewline
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | ForEach-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -like "*open-design*") {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Detenido" -ForegroundColor Green
} else {
    Write-Host " ❌ NO ESTÁ CORRIENDO" -ForegroundColor Red
}

# Iniciar daemon
Write-Host ""
Write-Host "Iniciando daemon de Open Design..." -NoNewline

$daemonScript = {
    $env:Path = "C:\Users\HP VICTUS\AppData\Roaming\npm;" + $env:Path
    Set-Location "C:\Users\HP VICTUS"
    open-design --no-open 2>&1 | Out-File -FilePath "$env:TEMP\open-design-daemon.log" -Append
}

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $daemonScript -WindowStyle Hidden

# Esperar a que inicie
Start-Sleep -Seconds 8

# Verificar si inició
$daemonRunning = Test-NetConnection -ComputerName 127.0.0.1 -Port 7456 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($daemonRunning) {
    Write-Host "✅ INICIADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Daemon corriendo en: http://127.0.0.1:7456" -ForegroundColor Cyan
    Write-Host "Logs en: $env:TEMP\open-design-daemon.log" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ ¡Open Design está listo para usar!" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR AL INICIAR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  1. npm no está en el PATH" -ForegroundColor Gray
    Write-Host "  2. El puerto 7456 está ocupado" -ForegroundColor Gray
    Write-Host "  3. Open Design no está instalado globalmente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solución:" -ForegroundColor Yellow
    Write-Host "  npm install -g @spec-ade/open-design" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -NoNewline
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")