import "dotenv/config";

const config = {
  name: "Rugby México",
  slug: "Ruby-Mexico",
  owner: "lolasux",
  version: "1.2.3",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  scheme: "rugby-mexico",
  icon: "./assets/images/FMRUUAPP.png",
  splash: {
    image: "./assets/images/FMRUUAPP.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  android: {
    package: "com.darkvenom.fmruapp",
    googleServicesFile: "./google-services.json",
    versionCode: 22,
    adaptiveIcon: {
      foregroundImage: "./assets/images/FMRUUAPP.png",
      backgroundColor: "#FFFFFF",
    },
    permissions: [
      "CAMERA",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "WRITE_EXTERNAL_STORAGE",
      "READ_EXTERNAL_STORAGE"
    ],
    allowBackup: false,
  },
  ios: {
    bundleIdentifier: "com.darkvenom.fmruapp",
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: "Esta app necesita acceso a la cámara para tomar fotos del usuario.",
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ["remote-notification"]
    }
  },
  updates: {
    enabled: false
  },
  runtimeVersion: "1.0.0",
  extra: {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    eas: {
      projectId: "2b279f3c-dc5a-4c08-9974-112504d19f3e"
    },
  },
  plugins: [
    "expo-camera",
    "expo-splash-screen",
    "expo-updates",
    "expo-file-system",
    "expo-font",
    "expo-router",
    "expo-web-browser",
    "expo-notifications",
    [
      "expo-build-properties",
      {
        android: {
          newArchEnabled: false,
          fabricEnabled: false
        },
        ios: {
          newArchEnabled: false,
          fabricEnabled: false
        }
      }
    ]
  ]
};

export default config as any;