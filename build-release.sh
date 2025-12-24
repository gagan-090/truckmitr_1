#!/bin/bash

# TruckMitr Release Build Script
# This script helps build the release version of the app

set -e  # Exit on error

echo "🚀 TruckMitr Release Build Script"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Warning about Razorpay keys
echo "⚠️  IMPORTANT: Make sure you've switched to LIVE Razorpay keys!"
echo "   Check src/utils/config/index.tsx"
echo ""
read -p "Have you switched to LIVE Razorpay keys? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please switch to LIVE Razorpay keys before building for production."
    exit 1
fi

# Clean previous builds
echo ""
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Ask what to build
echo ""
echo "What would you like to build?"
echo "1) APK (for direct installation)"
echo "2) AAB (for Google Play Store)"
echo "3) Both"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Building Release APK..."
        cd android
        ./gradlew assembleRelease
        cd ..
        echo ""
        echo "✅ APK built successfully!"
        echo "📍 Location: android/app/build/outputs/apk/release/app-release.apk"
        ;;
    2)
        echo ""
        echo "📦 Building Release AAB..."
        cd android
        ./gradlew bundleRelease
        cd ..
        echo ""
        echo "✅ AAB built successfully!"
        echo "📍 Location: android/app/build/outputs/bundle/release/app-release.aab"
        ;;
    3)
        echo ""
        echo "📦 Building Release APK..."
        cd android
        ./gradlew assembleRelease
        echo ""
        echo "📦 Building Release AAB..."
        ./gradlew bundleRelease
        cd ..
        echo ""
        echo "✅ Both APK and AAB built successfully!"
        echo "📍 APK Location: android/app/build/outputs/apk/release/app-release.apk"
        echo "📍 AAB Location: android/app/build/outputs/bundle/release/app-release.aab"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Test the release build on a physical device"
echo "2. Verify all features work correctly"
echo "3. Upload to Google Play Console"
echo ""
