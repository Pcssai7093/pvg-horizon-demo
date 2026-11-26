param(
  [Parameter(Mandatory = $true)][string]$ListingRoot
)

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'catalog-photo.ps1')
$families = @{
  '3Line' = '3Line necklaces'
  '5Line' = '5Line necklaces'
  '5Line AstaLaskhmi' = '5Line necklaces'
  '5Line Shimmer AL' = '5Line necklaces'
  'CZ' = 'CZ jewellery sets'
  'CZ Curb' = 'CZ jewellery sets'
  'Invisible' = 'Invisible necklaces'
  'Mangalsutra' = 'Mangalsutra necklaces'
  'Moti' = 'Moti necklaces'
  'Monalisa Moti' = 'Moti necklaces'
  'Nek1' = 'Nek1 necklaces'
  'Nek1 Stone' = 'Nek1 Stone nekclaces'
  'Nek2 Double' = 'Nek2 Double necklaces'
  'Nek2 Double Stone' = 'Nek2 Double Stone necklaces'
  'Pumpkin' = 'Pumpkin necklaces'
  'Pumpkin Stone' = 'Pumpkin necklaces'
  'Valadanda' = 'Valandanda necklaces'
  'Valadanda Shimmer' = 'Valandanda necklaces'
}
function Get-SkuKey([string]$value) {
  return (($value.Trim().TrimEnd('_','-') -replace '(?i)\s+master$','') -replace '[^a-zA-Z0-9]','').ToLowerInvariant()
}

$catalog = @(Get-Content (Join-Path $project 'src/imported-catalog.json') -Raw | ConvertFrom-Json | ForEach-Object { $_ })
$catalog += @(
  @{id='three-line-green';sku='3Line Green';collection='3Line'},
  @{id='five-line-red';sku='5Line Red';collection='5Line'},
  @{id='pumpkin-blue';sku='Pumpkin Stone Blue';collection='Pumpkin Stone'},
  @{id='valadanda-maroon';sku='Valadanda Shimmer Maroon';collection='Valadanda Shimmer'},
  @{id='cz-5469-maroon';sku='CZ 5469 Maroon';collection='CZ'}
)
$index = @{}
foreach ($family in ($families.Values | Sort-Object -Unique)) {
  $path = Join-Path $ListingRoot $family
  if (!(Test-Path -LiteralPath $path)) { continue }
  foreach ($folder in Get-ChildItem -LiteralPath $path -Directory -Recurse) {
    if ($folder.FullName -match '[\\/]backups([\\/]|$)') { continue }
    $sku = Get-SkuKey $folder.Name
    if ($folder.Parent.Name -match '(?i)\s+master$' -and $sku -ne (Get-SkuKey $folder.Parent.Name)) { continue }
    $photos = @(Get-ChildItem -LiteralPath $folder.FullName -File | Where-Object {
      $_.BaseName -match '^c[12]$' -and $_.Extension -match '^\.(png|jpe?g)$'
    } | Sort-Object BaseName)
    if (!$photos.Count -or $photos[0].BaseName -ne 'c1') { continue }
    $key = "$family|$sku"
    $preference = if ($folder.Name.EndsWith('__')) { 0 } elseif ($folder.Name.EndsWith('_')) { 1 } else { 2 }
    if (!$index.ContainsKey($key) -or $index[$key].preference -gt $preference) {
      $index[$key] = @{ photos=$photos; preference=$preference }
    }
  }
}
$destination = Join-Path $project 'public/catalog'
$overrides = [ordered]@{}
foreach ($item in $catalog) {
  if (!$families.ContainsKey($item.collection)) { continue }
  $match = $index["$($families[$item.collection])|$(Get-SkuKey $item.sku)"]
  if (!$match) { continue }
  $photos = @(
    foreach ($file in $match.photos) {
      $name = "bharathi-$($item.id)-$($file.BaseName.ToLowerInvariant()).jpg"
      try {
        Save-Photo $file.FullName (Join-Path $destination $name)
        $name
      } catch { Write-Warning "Could not convert $($item.sku) $($file.Name): $($_.Exception.Message)" }
    }
  )
  if ($photos.Count -gt 0 -and $photos[0] -like '*-c1.jpg') { $overrides[$item.id] = $photos }
}
ConvertTo-Json -InputObject $overrides -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $project 'src/listing-photos.json')
"Matched $($overrides.Count) SKUs with listing photography."
