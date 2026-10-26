# LG-10 helper: start local MySQL for test/dev, then remind how to start API.
# Usage (from repo root or any path):
#   powershell -ExecutionPolicy Bypass -File scripts/windows/start-test-env.ps1

$ErrorActionPreference = "Stop"
$MysqlStartBat = "C:\Users\PC\MySQL\start-mysql.bat"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

Write-Host "==> Checking MySQL on 127.0.0.1:3306 ..."
$listening = netstat -ano | Select-String "127.0.0.1:3306\s+.*LISTENING"
if (-not $listening) {
  if (-not (Test-Path $MysqlStartBat)) {
    Write-Host "MySQL start script not found: $MysqlStartBat"
    Write-Host "Update MysqlStartBat in this script, or start MySQL manually."
    exit 1
  }
  Write-Host "==> Starting MySQL via $MysqlStartBat"
  cmd /c "`"$MysqlStartBat`""
  Start-Sleep -Seconds 3
} else {
  Write-Host "MySQL already listening."
}

$listening = netstat -ano | Select-String "127.0.0.1:3306\s+.*LISTENING"
if (-not $listening) {
  Write-Host "MySQL still not listening on 3306. Abort."
  exit 1
}

$envFile = Join-Path $RepoRoot ".env"
if (-not (Test-Path $envFile)) {
  Write-Host "WARN: .env missing under $RepoRoot — copy from .env.example first."
} else {
  Write-Host "Found .env"
}

Write-Host ""
Write-Host "DB ready. Start backend from repo root:"
Write-Host "  cd `"$RepoRoot`""
Write-Host "  go run main.go --log-dir ./logs"
Write-Host "Then open http://localhost:3000/  and check /api/status"
Write-Host "Full process doc: docs/发布流程与测试环境-LG10.md"
