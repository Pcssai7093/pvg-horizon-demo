Add-Type -AssemblyName System.Drawing
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -EQ 'image/jpeg'
$quality = New-Object System.Drawing.Imaging.EncoderParameters(1)
$quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]84)

function Save-Photo($path, $output) {
  $source = [System.Drawing.Image]::FromFile($path)
  try {
    if ($source.PropertyIdList -contains 274) {
      $orientation = [BitConverter]::ToUInt16($source.GetPropertyItem(274).Value, 0)
      $rotations = @('RotateNoneFlipNone','RotateNoneFlipNone','RotateNoneFlipX','Rotate180FlipNone','Rotate180FlipX','Rotate90FlipX','Rotate90FlipNone','Rotate270FlipX','Rotate270FlipNone')
      if ($orientation -lt $rotations.Count) { $source.RotateFlip($rotations[$orientation]) }
    }
    $scale = [math]::Min(1.0, 1200.0 / [math]::Max($source.Width, $source.Height))
    $width = [math]::Max(1, [math]::Round($source.Width * $scale))
    $height = [math]::Max(1, [math]::Round($source.Height * $scale))
    if ($width -lt 2 -or $height -lt 2) { throw "Photo output is too small: ${width}x${height}" }
    $bitmap = New-Object System.Drawing.Bitmap([int]$width, [int]$height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($source, 0, 0, $width, $height)
      } finally { $graphics.Dispose() }
      $bitmap.Save($output, $jpeg, $quality)
    } finally { $bitmap.Dispose() }
  } finally { $source.Dispose() }
}


