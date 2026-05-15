#!/bin/bash

# Generate app icons for iOS and Android from Dreambid_logo2.svg
# Requires: ImageMagick (convert command)

echo "🎨 Generating DreamBid app icons from Dreambid_logo2.svg..."

# Create a temporary PNG version of the SVG at high resolution
echo "Converting SVG to high-res PNG..."
convert -background none -density 300 -resize 2048x2048 public/Dreambid_logo2.svg /tmp/dreambid-logo-hires.png

# Android Icon Sizes
echo "Generating Android icons..."

# mdpi (1x) - 48x48
convert /tmp/dreambid-logo-hires.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert /tmp/dreambid-logo-hires.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png

# hdpi (1.5x) - 72x72
convert /tmp/dreambid-logo-hires.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert /tmp/dreambid-logo-hires.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png

# xhdpi (2x) - 96x96
convert /tmp/dreambid-logo-hires.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert /tmp/dreambid-logo-hires.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

# xxhdpi (3x) - 144x144
convert /tmp/dreambid-logo-hires.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert /tmp/dreambid-logo-hires.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

# xxxhdpi (4x) - 192x192
convert /tmp/dreambid-logo-hires.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert /tmp/dreambid-logo-hires.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# iOS Icon Size
echo "Generating iOS icons..."

# iOS requires 1024x1024 for App Store
convert /tmp/dreambid-logo-hires.png -resize 1024x1024 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

# Clean up
rm /tmp/dreambid-logo-hires.png

echo "✅ App icons generated successfully!"
echo ""
echo "📱 Generated icon files:"
echo "Android:"
echo "  - mipmap-mdpi/ic_launcher.png (48x48)"
echo "  - mipmap-hdpi/ic_launcher.png (72x72)"
echo "  - mipmap-xhdpi/ic_launcher.png (96x96)"
echo "  - mipmap-xxhdpi/ic_launcher.png (144x144)"
echo "  - mipmap-xxxhdpi/ic_launcher.png (192x192)"
echo ""
echo "iOS:"
echo "  - Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png (1024x1024)"
