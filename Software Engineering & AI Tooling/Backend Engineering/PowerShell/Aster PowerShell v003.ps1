<# Aster PowerShell v003
Authenticated historical derivative: free a TCP port using native connection metadata with netstat fallback.
#>
function Stop-TcpPort([int]$Port) {
  try {
    $pids = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $pids) {
      if ($processId -and $processId -ne 0) { Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue }
    }
  } catch {
    try {
      $lines = netstat -ano | Select-String (":$Port\s")
      foreach ($line in $lines) {
        $parts = ($line -split "\s+") | Where-Object { $_ }
        $processId = $parts[-1]
        if ($processId -match "^\d+$") { Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue }
      }
    } catch {}
  }
}
