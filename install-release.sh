#!/bin/bash

echo "🚀 Building and Installing Release APK..."
echo ""

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    # Find the APK
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    
    if [ -f "$APK_PATH" ]; then
        echo "📱 Installing APK on connected device..."
        adb install -r "$APK_PATH"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ App installed successfully!"
            echo ""
            echo "📍 APK Location: android/$APK_PATH"
        else
            echo ""
            echo "❌ Installation failed. Make sure a device is connected."
            echo "You can manually install from: android/$APK_PATH"
        fi
    else
        echo "❌ APK not found at expected location"
    fi
else
    echo ""
    echo "❌ Build failed. Check the errors above."
fi
