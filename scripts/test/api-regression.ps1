# LG-09 API regression against test/prod-like environment.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/test/api-regression.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/test/api-regression.ps1 -BaseUrl https://modelrec.net

param(
  [string]$BaseUrl = "https://modelrec.net"
)

$ErrorActionPreference = "Continue"
$fail = 0
$pass = 0

function Ok($name) {
  $script:pass++
  Write-Host "[PASS] $name" -ForegroundColor Green
}
function Bad($name, $detail) {
  $script:fail++
  Write-Host "[FAIL] $name — $detail" -ForegroundColor Red
}

function Get-Http($path) {
  $url = "$BaseUrl$path"
  try {
    $resp = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 30
    return @{ Code = [int]$resp.StatusCode; Body = $resp.Content; Err = $null }
  } catch {
    $code = 0
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
    }
    return @{ Code = $code; Body = $null; Err = $_.Exception.Message }
  }
}

Write-Host "LG-09 API regression"
Write-Host "BaseUrl: $BaseUrl"
Write-Host ""

# R1 /api/status
$r = Get-Http "/api/status"
if ($r.Code -eq 200 -and $r.Body -match '"success"\s*:\s*true') { Ok "R1 GET /api/status" }
else { Bad "R1 GET /api/status" "code=$($r.Code) err=$($r.Err)" }

# R2 /api/pricing
$r = Get-Http "/api/pricing"
if ($r.Code -eq 200 -and $r.Body) { Ok "R2 GET /api/pricing" }
else { Bad "R2 GET /api/pricing" "code=$($r.Code) err=$($r.Err)" }

# R3 /api/notice
$r = Get-Http "/api/notice"
if ($r.Code -eq 200) { Ok "R3 GET /api/notice" }
else { Bad "R3 GET /api/notice" "code=$($r.Code) err=$($r.Err)" }

# R4 /api/about
$r = Get-Http "/api/about"
if ($r.Code -eq 200) { Ok "R4 GET /api/about" }
else { Bad "R4 GET /api/about" "code=$($r.Code) err=$($r.Err)" }

# R5 /
$r = Get-Http "/"
if ($r.Code -eq 200) { Ok "R5 GET /" }
else { Bad "R5 GET /" "code=$($r.Code) err=$($r.Err)" }

# R6 /pricing
$r = Get-Http "/pricing"
if ($r.Code -eq 200) { Ok "R6 GET /pricing" }
else { Bad "R6 GET /pricing" "code=$($r.Code) err=$($r.Err)" }

# R7 /v1/models without token — expect non-5xx (usually 401)
$r = Get-Http "/v1/models"
if ($r.Code -ge 500 -or ($r.Code -eq 0 -and $r.Err)) {
  Bad "R7 GET /v1/models (no token)" "code=$($r.Code) err=$($r.Err)"
} else {
  Ok "R7 GET /v1/models (no token) -> $($r.Code) (not 5xx)"
}

Write-Host ""
Write-Host "Result: PASS=$pass FAIL=$fail"
if ($fail -gt 0) { exit 1 } else { exit 0 }
