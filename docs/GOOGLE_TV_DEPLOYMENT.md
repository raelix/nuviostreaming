# Google TV / Android TV Deployment Guide

This guide explains how to build and deploy Nuvio Media Hub to Google TV or Android TV devices.

## Prerequisites

1. **Development Environment**
   - Node.js 18+ installed
   - Android Studio with Android SDK
   - Java 17+ (required for Gradle)
   - EAS CLI: `npm install -g eas-cli`

2. **Google TV Device**
   - Enable Developer Options: Settings → Device Preferences → About → Click "Build" 7 times
   - Enable USB Debugging: Settings → Device Preferences → Developer Options → USB Debugging
   - Enable Install from Unknown Sources: Settings → Apps → Security & Restrictions → Unknown sources

## Building the APK

### Option 1: Local Build (Recommended for Testing)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Clean and prebuild for TV
EXPO_TV=1 npx expo prebuild --platform android --clean

# 3. Fix duplicate androidsvg library conflict
# Add this to android/app/build.gradle at the end of the file:
cat >> android/app/build.gradle << 'EOF'

// Exclude duplicate androidsvg library (jar vs aar conflict)
configurations.all {
    exclude group: 'com.caverock', module: 'androidsvg'
}
EOF

# 4. Build the APK
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: EAS Build (Cloud Build)

```bash
# 1. Login to EAS
eas login

# 2. Build TV APK
eas build -p android --profile tv

# 3. Download APK from the EAS dashboard
```

### Option 3: Development Build

```bash
# For quick testing with hot reload
EXPO_TV=1 npx expo run:android
```

## Installing on Google TV

### Method 1: ADB Install (USB)

```bash
# 1. Connect TV via USB or ensure same network
adb connect <TV_IP_ADDRESS>:5555

# 2. Verify connection
adb devices

# 3. Install APK
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Method 2: ADB Install (WiFi)

```bash
# 1. Find your TV's IP address
# Settings → Network & Internet → [Your Network] → IP Address

# 2. Connect via ADB
adb connect 192.168.1.XXX:5555

# 3. Install APK
adb install -r app-release.apk
```

### Method 3: Sideload via File Manager

1. Copy APK to USB drive
2. Plug USB into Google TV
3. Use a file manager app (e.g., "File Commander" from Play Store)
4. Navigate to USB and install the APK

### Method 4: Send via Local Network

1. Install "Send Files to TV" on both phone and TV
2. Send the APK from phone to TV
3. Install from TV's Downloads folder

## TV-Specific Features

### D-Pad Navigation
- **Left/Right**: Navigate carousel items in Hero section
- **Up/Down**: Navigate between sections and buttons
- **Select/Enter**: Activate focused item
- **Back**: Navigate back

### Focus Indicators
All interactive elements show a blue focus ring when selected:
- Hero Play/Save buttons
- Content cards in catalogs
- Stream selection items
- Navigation buttons

### Remote Control in Video Player
- **Play/Pause**: Toggle playback
- **Left/Right**: Seek backward/forward 10 seconds
- **Select**: Toggle play/pause

## Troubleshooting

### App doesn't appear in launcher
- Google TV only shows "leanback" enabled apps in the main launcher
- Check if `android:banner` is set in AndroidManifest.xml
- Verify these are in your manifest:
  ```xml
  <uses-feature android:name="android.software.leanback" android:required="false" />
  <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
  ```

### Focus not working properly
- Ensure `isTVSelectable: true` is set on TouchableOpacity components
- Use `hasTVPreferredFocus: true` for initial focus

### Build fails with TV errors
```bash
# Clean and rebuild
cd android && ./gradlew clean
EXPO_TV=1 npx expo prebuild --clean
cd android && ./gradlew assembleRelease
```

### ADB connection issues
```bash
# Restart ADB server
adb kill-server
adb start-server

# Re-enable USB debugging on TV
# Settings → Developer Options → Revoke USB debugging authorizations
# Then re-enable USB debugging
```

## Build Profiles (eas.json)

The project includes these TV-specific build profiles:

```json
{
  "build": {
    "tv": {
      "extends": "production",
      "env": {
        "EXPO_TV": "1"
      }
    },
    "tv-preview": {
      "extends": "preview",
      "env": {
        "EXPO_TV": "1"
      }
    }
  }
}
```

## Recommended Testing Checklist

- [ ] App launches correctly on TV
- [ ] Hero carousel navigates with D-pad left/right
- [ ] Play button has focus and is selectable
- [ ] Content cards are focusable and show focus ring
- [ ] Stream selection works with D-pad
- [ ] Video player responds to remote controls
- [ ] Back button navigates correctly
- [ ] Settings screens are navigable
- [ ] Text inputs open on-screen keyboard

## Performance Tips

1. **Reduce animation complexity** on lower-end TV hardware
2. **Increase touch targets** - buttons should be at least 48x48dp
3. **Use larger fonts** - minimum 14sp for body text
4. **Test on actual hardware** - emulators don't accurately represent TV performance

## Resources

- [React Native TV Documentation](https://reactnative.dev/docs/building-for-tv)
- [react-native-tvos GitHub](https://github.com/react-native-tvos/react-native-tvos)
- [Expo TV Support](https://docs.expo.dev/guides/building-for-tv/)
- [Android TV Developer Guide](https://developer.android.com/training/tv)
