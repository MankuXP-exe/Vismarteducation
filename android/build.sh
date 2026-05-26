#!/usr/bin/env bash
set -euo pipefail

# ─── Vi Smart Android Build Script ─────────────────────────────────
# Prerequisites:
#   1. Node.js 20+
#   2. Java 17 (Zulu)
#   3. Android Studio with SDK 34
#   4. ANDROID_HOME environment variable set
#
# Usage:
#   chmod +x android/build.sh
#   ./android/build.sh [debug|release]

MODE="${1:-debug}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "═══ Vi Smart Android Builder ═══"
echo "Mode: $MODE"
echo "Root: $ROOT_DIR"

cd "$ROOT_DIR"

echo "→ Installing npm dependencies..."
npm install

echo "→ Syncing Capacitor..."
npx cap sync android

echo "→ Copying Capacitor config..."
npx cap copy android

cd android

if [ "$MODE" = "release" ]; then
    echo "→ Building RELEASE AAB..."
    ./gradlew bundleRelease
    echo ""
    echo "✅ AAB ready at:"
    echo "   android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "→ Building RELEASE APK..."
    ./gradlew assembleRelease
    echo ""
    echo "✅ APK ready at:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
else
    echo "→ Building DEBUG APK..."
    ./gradlew assembleDebug
    echo ""
    echo "✅ APK ready at:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
fi

echo ""
echo "═══ Build Complete ═══"
