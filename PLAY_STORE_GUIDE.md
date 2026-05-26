# Vi Smart — Google Play Store Deployment Guide

## 1. Prerequisites

- **Google Play Developer** account ($25 one-time)
- **Android Studio** (latest stable)
- **Google Services** from Firebase Console

## 2. Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create project: `vismart-learning-education`
3. Add Android app: package name `com.vismart.app`
4. Download `google-services.json` → replace `android/app/google-services.json`
5. Enable **Cloud Messaging** (FCM) for push notifications

## 3. Generate Keystore (Release Signing)

```bash
keytool -genkey -v -keystore android/keystore.jks \
  -alias vismart -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_STORE_PASS -keypass YOUR_KEY_PASS
```

Store these credentials securely — you'll need them for Play Console.

## 4. Build Release AAB

```bash
npm run cap:build:release
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## 5. Google Play Console

1. Go to https://play.google.com/console/
2. Create new app → name: **Vi Smart Learning Education**
3. Fill in:
   - App description
   - Category: **Education**
   - Content rating questionnaire
   - Privacy policy URL: `https://vismartlearningeducation.com/privacy`
4. Upload the AAB from step 4
5. Complete store listing with screenshots (min 2)
6. Set up pricing → **Free**
7. Submit for review

## 6. Post-Deploy

| Task | URL |
|------|-----|
| Monitor crashes | Play Console > Android Vital |
| Push notifications | Firebase Console > Cloud Messaging |
| App updates | Push code → GitHub → CI builds AAB → manual upload to Play Console |

## 7. Play Store Secrets (GitHub Actions)

For CI builds, add these secrets to GitHub repo > Settings > Secrets:

| Secret | Value |
|--------|-------|
| `ANDROID_KEYSTORE_BASE64` | `base64 android/keystore.jks \| pbcopy` |
| `ANDROID_KEYSTORE_PASSWORD` | Your keystore password |
| `ANDROID_KEY_PASSWORD` | Your key password |
| `GOOGLE_SERVICES_JSON` | Contents of google-services.json |

## 8. Required Play Store Assets

- **App icon** (512×512 PNG) — generated in `android/app/src/main/res/`
- **Feature graphic** (1024×500 PNG)
- **Phone screenshots** (at least 2)
- **Tablet screenshots** (optional but recommended)
- **Privacy policy** hosted at `https://vismartlearningeducation.com/privacy`

## 9. Version Updates

To update app version:

1. Edit version in `android/app/build.gradle`:
   ```groovy
   versionCode 2  // increment per release
   versionName "1.1.0"
   ```
2. Rebuild and upload to Play Console

## 10. Need Help?

- Capacitor docs: https://capacitorjs.com/docs/android
- Play Console help: https://support.google.com/googleplay/android-developer
