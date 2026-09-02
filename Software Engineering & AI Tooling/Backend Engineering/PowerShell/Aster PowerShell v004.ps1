<# Aster PowerShell v004
Authenticated historical derivative: poll an HTTP endpoint until success or timeout without exposing credentials.
#>
function Wait-HttpOk([string]$Url, [int]$TimeoutSec = 25, [hashtable]$Headers = $null) {
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      if ($Headers) { $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3 -Headers $Headers }
      else { $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3 }
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 250
  }
  return $false
}
