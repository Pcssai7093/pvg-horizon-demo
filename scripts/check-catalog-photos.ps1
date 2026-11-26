param([string]$AssetDirectory)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$project = Split-Path -Parent $PSScriptRoot
if (!$AssetDirectory) { $AssetDirectory = Join-Path $project 'public/catalog' }

function Read-CatalogJson($name) {
  Get-Content -LiteralPath (Join-Path $project "src/$name.json") -Raw | ConvertFrom-Json
}

$listing = Read-CatalogJson 'listing-photos'
$reviewed = Read-CatalogJson 'reviewed-photos'
$featured = Read-CatalogJson 'photos'
$products = @(Read-CatalogJson 'imported-catalog' | ForEach-Object { $_ })
$products += @($featured.PSObject.Properties | ForEach-Object { @{ id=$_.Name; photos=$_.Value } })
$count = 0
foreach ($product in $products) {
  $originals = if ($product.photos.Count) { $product.photos } else { $reviewed.($product.id) }
  $photos = @(@($listing.($product.id)) + @($originals) | Where-Object { $_ } | Select-Object -First 4)
  if (!$photos.Count) { throw "Missing gallery for $($product.id)" }
  foreach ($file in $photos) {
    $path = (Resolve-Path -LiteralPath (Join-Path $AssetDirectory $file)).Path
    $image = [Drawing.Bitmap]::new($path)
    try {
      if ($image.Width -lt 2 -or $image.Height -lt 2) {
        throw "Undersized catalog photo: $file ($($image.Width)x$($image.Height))"
      }
      $colours = [Collections.Generic.HashSet[int]]::new()
      foreach ($x in 1..5) {
        foreach ($y in 1..5) {
          $null = $colours.Add($image.GetPixel([int]($image.Width*$x/6), [int]($image.Height*$y/6)).ToArgb())
        }
      }
      if ($colours.Count -lt 2) { throw "Blank catalog photo: $file" }
      $count++
    } finally { $image.Dispose() }
  }
}
"Verified $count nonblank photos across $($products.Count) products."
