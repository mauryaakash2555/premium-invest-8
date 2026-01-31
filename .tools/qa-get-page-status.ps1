param(
  [Parameter(Mandatory = $true)]
  [string]$Url,

  [int]$TimeoutSeconds = 20
)

$ErrorActionPreference = 'Stop'

try {
  $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec $TimeoutSeconds -SkipHttpErrorCheck $Url
  Write-Output ("STATUS={0}" -f $r.StatusCode)
} catch {
  $msg = $_.Exception.Message
  Write-Output ("ERROR={0}" -f $msg)
  exit 1
}
