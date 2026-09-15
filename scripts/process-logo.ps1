Add-Type -AssemblyName System.Drawing

$srcPath = "c:\murali\projects\showara-web\public\logo.jpg"
$bmp = [System.Drawing.Bitmap]::new($srcPath)
$out = [System.Drawing.Bitmap]::new($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Find bounding boxes of content
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# Icon bounds
$iconMinX = $bmp.Width
$iconMaxX = 0
$iconMinY = $bmp.Height
$iconMaxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $max = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        if ($max -le 25) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = 255
            if ($max -lt 70) {
                $alpha = [int](($max - 25) / 45.0 * 255)
            }
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }

            # If in upper region (icon)
            if ($y -lt 490) {
                if ($x -lt $iconMinX) { $iconMinX = $x }
                if ($x -gt $iconMaxX) { $iconMaxX = $x }
                if ($y -lt $iconMinY) { $iconMinY = $y }
                if ($y -gt $iconMaxY) { $iconMaxY = $y }
            }
        }
    }
}

$out.Save("c:\murali\projects\showara-web\public\logo-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Overall bounds: X: $minX to $maxX, Y: $minY to $maxY"
Write-Host "Icon bounds: X: $iconMinX to $iconMaxX, Y: $iconMinY to $iconMaxY"

# Crop icon with small margin
$pad = 10
$cropX = [Math]::Max(0, $iconMinX - $pad)
$cropY = [Math]::Max(0, $iconMinY - $pad)
$cropW = [Math]::Min($bmp.Width - $cropX, ($iconMaxX - $iconMinX) + 2 * $pad)
$cropH = [Math]::Min($bmp.Height - $cropY, ($iconMaxY - $iconMinY) + 2 * $pad)

$iconRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
$iconBmp = $out.Clone($iconRect, $out.PixelFormat)
$iconBmp.Save("c:\murali\projects\showara-web\public\logo-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Also create high-res resized icon (e.g. 128x128 and 64x64 for favicon / badges)
$resized128 = [System.Drawing.Bitmap]::new(128, 128)
$g = [System.Drawing.Graphics]::FromImage($resized128)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($iconBmp, 0, 0, 128, 128)
$g.Dispose()
$resized128.Save("c:\murali\projects\showara-web\public\logo-icon-128.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Favicon 32x32
$resized32 = [System.Drawing.Bitmap]::new(32, 32)
$g32 = [System.Drawing.Graphics]::FromImage($resized32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.DrawImage($iconBmp, 0, 0, 32, 32)
$g32.Dispose()
$resized32.Save("c:\murali\projects\showara-web\public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Tightly cropped full logo
$fullRect = [System.Drawing.Rectangle]::new($minX - 5, $minY - 5, ($maxX - $minX) + 10, ($maxY - $minY) + 10)
$fullBmp = $out.Clone($fullRect, $out.PixelFormat)
$fullBmp.Save("c:\murali\projects\showara-web\public\logo-full.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Wordmark + tagline
$wmRect = [System.Drawing.Rectangle]::new($minX - 5, 495, ($maxX - $minX) + 10, ($maxY - 495) + 10)
$wmBmp = $out.Clone($wmRect, $out.PixelFormat)
$wmBmp.Save("c:\murali\projects\showara-web\public\logo-wordmark.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Horizontal lockup (icon on left, wordmark on right)
$hIconW = [int]($iconBmp.Width * (160.0 / $iconBmp.Height))
$hIconH = 160
$hTotalW = $hIconW + 25 + $wmBmp.Width
$hTotalH = [Math]::Max($hIconH, $wmBmp.Height) + 20

$hBmp = [System.Drawing.Bitmap]::new($hTotalW, $hTotalH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gh = [System.Drawing.Graphics]::FromImage($hBmp)
$gh.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gh.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gh.DrawImage($iconBmp, 0, 10, $hIconW, $hIconH)
$gh.DrawImage($wmBmp, $hIconW + 25, 0, $wmBmp.Width, $wmBmp.Height)
$gh.Dispose()
$hBmp.Save("c:\murali\projects\showara-web\public\logo-horizontal.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Successfully generated transparent logo, icon, horizontal lockup, and favicons!"
