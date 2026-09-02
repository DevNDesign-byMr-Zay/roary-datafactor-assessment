<# Aster PowerShell v001
Authenticated historical derivative: timestamped structured console logging.
Product identity, credentials, private paths, and provider coupling removed.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-AsterLog([string]$Tag, [string]$Message) {
  $ts = (Get-Date).ToString("HH:mm:ss")
  Write-Host "[$ts] [$Tag] $Message"
}
