#!/bin/bash

# TruckMitr Keystore Setup Script
# This script helps you set up the release keystore configuration

set -e

echo "🔐 TruckMitr Keystore Setup"
echo "============================"
echo ""

# Check if keystore.properties already exists
if [ -f "android/keystore.properties" ]; then
    echo "⚠️  keystore.properties already exists!"
    echo ""
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 0
    fi
fi

# Check if release.keystore exists
if [ ! -f "android/app/release.keystore" ]; then
    echo "❌ Error: release.keystore not found in android/app/"
    echo ""
    echo "Options:"
    echo "1. If you have an existing keystore, copy it to android/app/release.keystore"
    echo "2. Generate a new keystore (only if you've NEVER published this app):"
    echo ""
    echo "   cd android/app"
    echo "   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \\"
    echo "           -alias truckmitr-key -keyalg RSA -keysize 2048 -validity 10000"
    echo ""
    exit 1
fi

echo "✅ Found release.keystore"
echo ""

# Get keystore information
echo "Please enter your keystore credentials:"
echo "(These will be saved to android/keystore.properties)"
echo ""

read -p "Keystore Password: " -s STORE_PASSWORD
echo ""
read -p "Key Alias (e.g., key0, truckmitr-key): " KEY_ALIAS
read -p "Key Password (press Enter if same as keystore password): " -s KEY_PASSWORD
echo ""

# If key password is empty, use store password
if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD="$STORE_PASSWORD"
fi

echo ""
echo "🔍 Verifying keystore credentials..."

# Test the keystore
if keytool -list -keystore android/app/release.keystore -alias "$KEY_ALIAS" -storepass "$STORE_PASSWORD" -keypass "$KEY_PASSWORD" > /dev/null 2>&1; then
    echo "✅ Keystore credentials verified!"
else
    echo "❌ Error: Could not verify keystore credentials."
    echo "Please check your password and alias, then try again."
    exit 1
fi

# Create keystore.properties
cat > android/keystore.properties << EOF
storePassword=$STORE_PASSWORD
keyPassword=$KEY_PASSWORD
keyAlias=$KEY_ALIAS
storeFile=release.keystore
EOF

echo ""
echo "✅ Created android/keystore.properties"
echo ""

# Show keystore info
echo "📋 Keystore Information:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
keytool -list -v -keystore android/app/release.keystore -alias "$KEY_ALIAS" -storepass "$STORE_PASSWORD" | grep -A 5 "Alias name:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🎉 Keystore setup complete!"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. ✅ keystore.properties is in .gitignore (won't be committed)"
echo "2. ⚠️  BACKUP your release.keystore file securely!"
echo "3. ⚠️  BACKUP your keystore credentials in a password manager!"
echo "4. ⚠️  If you lose the keystore, you can NEVER update your app!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Build your release: ./build-release.sh"
echo "2. Test the signed APK/AAB on a device"
echo "3. Upload to Google Play Console"
echo ""
