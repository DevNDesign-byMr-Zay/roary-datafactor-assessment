<# Aster PowerShell v002
Authenticated historical derivative: resolve a project virtual-environment Python interpreter with system fallback.
#>
function Resolve-PythonExecutable([string]$Root) {
  $venvPython = Join-Path $Root ".venv\Scripts\python.exe"
  if (Test-Path $venvPython) { return $venvPython }
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw "Python not found. Activate a virtual environment or install Python."
}
