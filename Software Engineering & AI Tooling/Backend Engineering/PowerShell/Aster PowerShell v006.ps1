<# Aster PowerShell v006
Authenticated historical derivative: start a background process with isolated stdout/stderr logs and explicit working directory.
#>
function Start-LoggedProcess(
  [Parameter(Mandatory=$true)][string]$Name,
  [Parameter(Mandatory=$true)][string]$WorkDir,
  [Parameter(Mandatory=$true)][string]$Executable,
  [Parameter(Mandatory=$true)][string[]]$Arguments
) {
  $logDir = Join-Path $WorkDir ".logs"
  if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
  $stdout = Join-Path $logDir "$Name.out.log"
  $stderr = Join-Path $logDir "$Name.err.log"
  $clean = @($Arguments | Where-Object { $_ -ne $null -and $_ -ne "" })
  if ($clean.Count -eq 0) { throw "No process arguments supplied." }
  $quoted = foreach ($argument in $clean) {
    $escaped = $argument -replace '"','\"'
    if ($escaped -match '\s') { '"' + $escaped + '"' } else { $escaped }
  }
  $argLine = ($quoted -join ' ')
  return Start-Process -FilePath $Executable -ArgumentList $argLine -WorkingDirectory $WorkDir -WindowStyle Hidden `
    -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
}
