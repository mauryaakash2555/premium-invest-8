param(
  [Parameter(Mandatory = $true)]
  [string]$Url,

  [int]$TimeoutSeconds = 30,

  [int]$MaxChars = 1200
)

$ErrorActionPreference = 'Stop'

try {
  $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec $TimeoutSeconds -SkipHttpErrorCheck $Url
  Write-Output ("STATUS={0}" -f $r.StatusCode)
  if ($null -ne $r.Content) {
    $c = [string]$r.Content
    $len = $c.Length
    $take = [Math]::Min($MaxChars, $len)
    Write-Output ("CHARS={0}" -f $len)
    Write-Output ($c.Substring(0, $take))
  }
} catch {
  Write-Output ("ERROR={0}" -f $_.Exception.Message)
  exit 1
}
