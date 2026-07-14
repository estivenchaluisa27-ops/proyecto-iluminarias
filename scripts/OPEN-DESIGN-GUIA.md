# 🔄 Cómo Reiniciar Open Design Daemon

## ⚡ Método Rápido (RECOMENDADO)

**Doble-click al acceso directo en el escritorio:**
```
📁 Open Design Daemon.lnk
```

El script automáticamente:
- ✅ Verifica si está corriendo
- ✅ Lo detiene si es necesario
- ✅ Lo inicia si está apagado
- ✅ Te muestra el estado

---

## 📂 Ubicación de los Scripts

| Archivo | Ubicación | Uso |
|---------|-----------|-----|
| **Acceso directo** | `Desktop\Open Design Daemon.lnk` | Doble-click |
| **Script Batch** | `scripts\restart-open-design.bat` | Doble-click |
| **Script PowerShell** | `scripts\restart-open-design.ps1` | Click derecho → Run with PowerShell |

---

## 💻 Comandos Manuales

### Verificar si está corriendo:
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 7456 -InformationLevel Quiet
```

**Resultado:**
- `True` ✅ = Está corriendo
- `False` ❌ = Necesita reinicio

### Iniciar daemon:
```powershell
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "open-design --no-open" -WindowStyle Hidden
```

### Detener daemon:
```powershell
Get-Process | Where-Object { $_.ProcessName -eq "node" } | ForEach-Object {
    $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmd -like "*open-design*") { Stop-Process -Id $_.Id -Force }
}
```

### Ver logs del daemon:
```powershell
Get-Content "$env:TEMP\open-design-daemon.log" -Tail 20
```

---

## 🚨 ¿Cuándo necesito reiniciar?

Reinicia el daemon cuando:

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| `open-design_get_active_context` falla | Daemon detenido | Usar acceso directo |
| Error "cannot reach daemon" | Daemon cerrado | Doble-click al ícono |
| Recursos `od://` no aparecen | Daemon no iniciado | Ejecutar script |
| After reboot | Reinicio de PC | Iniciar manualmente |

---

## ⚙️ Configuración del Daemon

| Parámetro | Valor |
|-----------|-------|
| **Puerto** | 7456 |
| **Host** | 127.0.0.1 (localhost) |
| **URL** | http://127.0.0.1:7456 |
| **Instalación** | Global (`npm install -g @spec-ade/open-design`) |
| **Ejecutable** | `C:\Users\HP VICTUS\AppData\Roaming\npm\open-design.cmd` |

---

## 📝 Notas Importantes

1. **El daemon debe estar corriendo siempre** para usar Open Design
2. **Se ejecuta en segundo plano** - no verás ventana
3. **Persiste después de cerrar terminal** - no se apaga automáticamente
4. **Se apaga al reiniciar la PC** - necesitas reiniciarlo manualmente
5. **Consume ~100-200MB RAM** - normal para un servidor local

---

## 🔧 Solución de Problemas

### Problema: "open-design no se reconoce"
**Solución:**
```powershell
npm install -g @spec-ade/open-design
```

### Problema: "Puerto 7456 ya en uso"
**Solución:**
```powershell
# Matar proceso que usa el puerto
Get-NetTCPConnection -LocalPort 7456 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
# Reiniciar daemon
.\scripts\restart-open-design.bat
```

### Problema: "No se puede conectar al daemon"
**Solución:**
1. Verificar que el daemon esté corriendo (Test-NetConnection)
2. Si no está corriendo, usar el acceso directo
3. Si persiste, revisar logs en `$env:TEMP\open-design-daemon.log`

### Problema: El daemon inicia pero se cierra inmediatamente
**Solución:**
```powershell
# Ver logs detallados
Get-Content "$env:TEMP\open-design-daemon.log" -Tail 50

# Reinstalar Open Design
npm uninstall -g @spec-ade/open-design
npm install -g @spec-ade/open-design
```

---

## 📞 Soporte

Si nada funciona:

1. **Reinstalar Open Design:**
   ```powershell
   npm uninstall -g @spec-ade/open-design
   npm install -g @spec-ade/open-design
   ```

2. **Reiniciar la computadora** (a veces ayuda)

3. **Verificar instalación:**
   ```powershell
   npm list -g @spec-ade/open-design
   open-design --version
   ```

---

**Última actualización:** 2026-07-12
**Versión de Open Design:** 0.8.11