# BM Wealth Golden Wings Favicon Setup

## Current Status

The favicon structure has been set up with a **PLACEHOLDER** logo. The actual BM Wealth golden wings logo needs to be manually replaced.

## Why Placeholder?

The domain `files.catbox.moe` is blocked in the build environment, preventing automatic download of the logo from:
https://files.catbox.moe/pzwlo0.png

## To Complete the Setup:

### Step 1: Download the Actual Logo
Download the BM Wealth golden wings logo from:
- URL: https://files.catbox.moe/pzwlo0.png
- Save it as: `bm_wealth_logo.png`

### Step 2: Convert to Favicon Formats
Use ImageMagick to convert the logo to all required formats:

```bash
# Install ImageMagick if needed
sudo apt-get install imagemagick

# Navigate to a working directory
cd /tmp/favicon_work

# Copy your downloaded logo
cp /path/to/your/bm_wealth_logo.png .

# Convert to individual sizes
convert bm_wealth_logo.png -resize 16x16 favicon-16x16.png
convert bm_wealth_logo.png -resize 32x32 favicon-32x32.png
convert bm_wealth_logo.png -resize 64x64 favicon-64x64.png
convert bm_wealth_logo.png -resize 192x192 icon-192x192.png
convert bm_wealth_logo.png -resize 512x512 icon-512x512.png
convert bm_wealth_logo.png -resize 180x180 apple-touch-icon.png

# Create multi-resolution favicon.ico
convert favicon-16x16.png favicon-32x32.png favicon-64x64.png favicon.ico
```

### Step 3: Replace Files
Copy the generated files to the public directory:

```bash
cp favicon.ico icon-192x192.png icon-512x512.png apple-touch-icon.png frontend/public/
```

## Files Created

All necessary files have been created with placeholder content:

- ✓ `favicon.ico` - Multi-resolution favicon (16x16, 32x32, 64x64)
- ✓ `icon-192x192.png` - PWA icon (192x192)
- ✓ `icon-512x512.png` - PWA icon (512x512)
- ✓ `apple-touch-icon.png` - Apple touch icon (180x180)
- ✓ `site.webmanifest` - Web app manifest with icon references
- ✓ `index.html` - Updated with favicon and manifest links

## Configuration Details

### Theme Color
The theme color has been set to golden: `#D4AF37`
This matches the golden wings branding.

### Manifest
The `site.webmanifest` file includes:
- App name: "BM Wealth - Mumbai's Premier Financial Partner"
- Short name: "BM Wealth"
- Theme color: Gold (#D4AF37)
- Background: Black (#000000)
- Icons: 192x192 and 512x512 for PWA support

### HTML Links
The `index.html` includes:
- Favicon link: `<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />`
- Apple touch icon: `<link rel="apple-touch-icon" href="%PUBLIC_URL%/apple-touch-icon.png" />`
- Manifest link: `<link rel="manifest" href="%PUBLIC_URL%/site.webmanifest" />`

## Testing

After replacing with the actual logo, test the favicon:

1. **Local Development:**
   ```bash
   cd frontend
   npm start
   ```
   Check the browser tab for the favicon.

2. **Production Build:**
   ```bash
   cd frontend
   npm run build
   ```
   Test the built files in the `build` directory.

3. **Browser Testing:**
   - Chrome/Edge: Check tab icon
   - Firefox: Check tab icon
   - Safari: Check tab icon and bookmarks
   - Mobile: Test PWA installation with proper icons

## Notes

- The placeholder logo is a simple golden wings design for testing
- All file paths use `%PUBLIC_URL%` for proper resolution
- The favicon.ico contains multiple resolutions for best compatibility
- PWA icons support both regular and maskable purposes
- The golden color scheme (#D4AF37) represents premium wealth management

## Delete This File

Once the actual logo has been installed and tested, you can delete this README file.
