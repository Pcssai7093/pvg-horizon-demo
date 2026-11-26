param(
  [Parameter(Mandatory = $true)][string]$CatalogRoot
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'catalog-photo.ps1')
$project = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $project 'public/catalog'
$skip = '^(Bindi$|Bindis-|CZ - Copy$|Double Earings$|Double Stone Earings$|Earings$|Motis -|Nek2 Double - amazon$|New folder$|short necklace Tarala$|short necklaces - brightness|Others$)'
$featured = @(
  '3Line Green', '5Line Red', 'Pumpkin Stone Blue', 'Valadanda Shimmer Maroon',
  'Short Ball Chain', 'CZ 5469 Maroon'
)


function Test-OriginalPhoto($file) {
  return $file.BaseName -match '^(IMG|DSC|DSF|PXL|DCIM|WhatsApp Image|product[_ -](display|tabletop|inhand))'
}

$root = (Resolve-Path -LiteralPath $CatalogRoot).Path
$shortSkus = @{}
$entries = @(
  foreach ($collection in Get-ChildItem -LiteralPath $root -Directory | Where-Object Name -NotMatch $skip | Sort-Object Name) {
    $folders = @($collection) + @(Get-ChildItem -LiteralPath $collection.FullName -Recurse -Directory | Sort-Object FullName)
    foreach ($folder in $folders) {
      if ($folder.FullName -match '[\\/]CZ New Listings([\\/]|$)') { continue }
      if ($folder.FullName -eq $collection.FullName -and $collection.Name -ne 'Pearl Mahalakshmi') { continue }
      $sku = ($folder.Name -replace '\s+', ' ').Trim()
      if ($featured -contains $sku -or $sku -match '^(AI shoot images|edited photos|raw photos|listing images)$') { continue }
      if ($collection.Name -match '^short necklace') {
        $sku = $sku.TrimEnd('_')
        if ($shortSkus.ContainsKey($sku)) { continue }
      }
      $photos = @(Get-ChildItem -LiteralPath $folder.FullName -File | Where-Object {
        $_.Extension -match '^\.(jpe?g|png)$' -and $_.Name -notmatch 'banner|size.chart|logo|gemini|collage|screenshot|measure'
      } | Sort-Object @{Expression={if ($_.Name -match '^(product shoot|p1\.)'){0}else{1}}}, Name)
      if (!$photos.Count) { continue }
      $relative = $folder.FullName.Substring($root.Length).TrimStart([char]92)
      $id = 'catalog-' + (($relative.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-'))
      $index = 0
      $originalPhotos = @($photos | Where-Object { Test-OriginalPhoto $_ })
      $gallery = @(
        foreach ($photo in $originalPhotos) {
          if ($index -ge 3) { break }
          $name = "original-$id-$($index + 1).jpg"
          try { Save-Photo $photo.FullName (Join-Path $destination $name) }
          catch { Write-Warning "Skipped $($photo.FullName): $($_.Exception.Message)"; continue }
          $index++
          $name
        }
      )
      if ($photos.Count) {
        if ($collection.Name -match '^short necklace') { $shortSkus[$sku] = $true }
        [ordered]@{ id=$id; sku=$sku; collection=$collection.Name; photos=$gallery; coverRank=4 }
      }
    }
  }
)
$duplicates = $entries | Group-Object { $_['id'] } | Where-Object Count -gt 1
if ($duplicates) { throw "Duplicate catalog identifiers: $($duplicates.Name -join ', ')" }
ConvertTo-Json -InputObject $entries -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $project 'src/imported-catalog.json')
"$($entries.Count) additional products"






