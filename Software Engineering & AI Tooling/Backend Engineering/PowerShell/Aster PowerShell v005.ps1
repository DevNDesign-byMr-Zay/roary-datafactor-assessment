<# Aster PowerShell v005
Authenticated historical derivative: quote process arguments safely when paths contain spaces.
#>
function ConvertTo-QuotedArgument([string]$Argument) {
  if ($null -eq $Argument) { return "" }
  $escaped = $Argument -replace '"','\"'
  if ($escaped -match '\s') { return '"' + $escaped + '"' }
  return $escaped
}

function Join-ProcessArguments([string[]]$Arguments) {
  $clean = @($Arguments | Where-Object { $_ -ne $null -and $_ -ne "" })
  if ($clean.Count -eq 0) { throw "No process arguments supplied." }
  return (($clean | ForEach-Object { ConvertTo-QuotedArgument $_ }) -join ' ')
}
