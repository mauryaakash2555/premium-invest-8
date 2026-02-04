$ErrorActionPreference = 'Continue'

$url = 'https://bmwealth.co.in/about'
$outFile = '.tmp_bm_oklch_extract.txt'

$out = New-Object System.Collections.Generic.List[string]
$out.Add('url=' + $url)

try {
  $html = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content
} catch {
  $out.Add('ERROR: failed to fetch html')
  $out.Add($_.Exception.Message)
  $out | Set-Content -Encoding UTF8 $outFile
  exit 0
}

$cssLinks = [regex]::Matches($html, '<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"', 'IgnoreCase') |
  ForEach-Object { $_.Groups[1].Value } |
  Select-Object -Unique

$out.Add('stylesheets=' + ($cssLinks.Count))
foreach ($link in $cssLinks) {
  $out.Add('css=' + $link)
}

$oklch = New-Object System.Collections.Generic.List[string]

foreach ($link in $cssLinks) {
  $abs = if ($link -match '^https?://') {
    $link
  } elseif ($link.StartsWith('/')) {
    'https://bmwealth.co.in' + $link
  } else {
    'https://bmwealth.co.in/' + $link
  }

  try {
    $css = (Invoke-WebRequest -Uri $abs -UseBasicParsing).Content
    $oklchMatches = [regex]::Matches($css, 'oklch\([^\)]+\)')
    foreach ($m in $oklchMatches) {
      $oklch.Add($m.Value)
    }
  } catch {
    $out.Add('failed=' + $abs)
  }
}

$unique = $oklch | Select-Object -Unique | Sort-Object
$out.Add('unique_oklch=' + ($unique.Count))

# Dump first few hundred values for inspection.
foreach ($v in ($unique | Select-Object -First 500)) {
  $out.Add($v)
}

$out | Set-Content -Encoding UTF8 $outFile
exit 0
