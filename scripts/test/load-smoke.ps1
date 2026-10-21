# LG-09 light load smoke (no external hey/ab required).
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/test/load-smoke.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/test/load-smoke.ps1 -BaseUrl https://modelrec.net -Count 30

param(
  [string]$BaseUrl = "https://modelrec.net",
  [int]$Count = 30,
  # Remote WAN from laptop is often >500ms; same-region target stays in LG-09 doc (500ms).
  [double]$MaxErrRatePercent = 1,
  [double]$MaxP95Ms = 2000
)

$ErrorActionPreference = "Continue"
$path = "/api/status"
$times = New-Object System.Collections.Generic.List[double]
$errors = 0

Write-Host "LG-09 load smoke: $Count x GET $BaseUrl$path"

for ($i = 1; $i -le $Count; $i++) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-WebRequest -Uri "$BaseUrl$path" -UseBasicParsing -TimeoutSec 30
    $sw.Stop()
    if ($resp.StatusCode -ne 200 -or $resp.Content -notmatch '"success"\s*:\s*true') {
      $errors++
    } else {
      $times.Add($sw.Elapsed.TotalMilliseconds)
    }
  } catch {
    $sw.Stop()
    $errors++
  }
}

if ($times.Count -eq 0) {
  Write-Host "All requests failed. errors=$errors"
  exit 1
}

$sorted = $times | Sort-Object
$avg = ($times | Measure-Object -Average).Average
$p95Index = [Math]::Min($sorted.Count - 1, [int][Math]::Ceiling($sorted.Count * 0.95) - 1)
if ($p95Index -lt 0) { $p95Index = 0 }
$p95 = $sorted[$p95Index]
$max = ($times | Measure-Object -Maximum).Maximum
$errRate = [math]::Round(100.0 * $errors / $Count, 2)

Write-Host ("success={0} errors={1} errRate={2}% avgMs={3:N0} p95Ms={4:N0} maxMs={5:N0}" -f $times.Count, $errors, $errRate, $avg, $p95, $max)

Write-Host ("gates: errRate<{0}% p95<{1}ms" -f $MaxErrRatePercent, $MaxP95Ms)
if ($errRate -ge $MaxErrRatePercent -or $p95 -ge $MaxP95Ms) {
  Write-Host "LOAD_SMOKE: CHECK — review before heavy release"
  exit 1
}
Write-Host "LOAD_SMOKE: OK"
exit 0
