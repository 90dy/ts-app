import 'tsm'; // permit to use other .ts files without transpilation

import { ExpoConfig } from '@expo/config';
import expoPackageJson from 'expo/package.json';
import { coerce as semver, SemVer } from 'semver';
import path from 'path'

import { APP_BUILD as appBuild, APP_BUNDLE as appBundle, APP_NAME as appName, NODE_ENV, SENTRY_AUTH_TOKEN, EXPO_PROJECT_ID as projectId } from './dotenv';
import { version } from './package.json';
import { NSUserTrackingUsageDescription as userTrackingPermission } from './translations/en/expo.json';

const semVer = semver(version);
if (!semVer) throw new Error('Incompatible version');

const expoMajorVersion = expoPackageJson.version.split('.')[0]!;

export default (): ExpoConfig => ({
  sdkVersion: `${expoMajorVersion}.0.0`,
  runtimeVersion: `exposdk:${expoMajorVersion}.0.0`,
  name: '90dy',
  version: getVersion(semVer),
  owner: '90dy',
  slug: '90dy',
  scheme: '90dy',
  orientation: 'portrait',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#90d7",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${projectId}`,
  },
  extra: {
    eas: {
      projectId: `${projectId}`,
    },
  },
  locales: {
    fr: './translations/fr/expo.json',
    nl: './translations/nl/expo.json',
  },
  ios: {
    icon: `./assets/icon-${appBuild}-ios.png`,
    supportsTablet: true,
    bundleIdentifier: `${appBundle}.${appBuild}`,
    buildNumber: getIosBuildNumber(semVer),
    googleServicesFile: `./resources/firebase/GoogleService-Info.${appBuild}.plist`,
    infoPlist: {
      CFBundleLocalizations: ['fr', 'nl'],
      CFBundleDevelopmentRegion: 'fr',
      UIBackgroundModes: ['fetch', 'remote-notification'],
      // enable firebase messaging
      // @see https://www.appsloveworld.com/coding/ios/799/firebase-cloud-messaging-test-message-is-not-being-received-on-ios
      // @see https://stackoverflow.com/questions/37933387/firebase-cloud-messaging-doesnt-create-push-notifications-but-gets-information
      FirebaseAppDelegateProxyEnabled: true,
    },
    entitlements: {
      'aps-environment': NODE_ENV,
    },
    // hermes does not support firebase
    // @see https://github.com/expo/expo/issues/19865
    // @see https://forums.expo.dev/t/expo-46-eas-react-native-firebase-and-hermes/67396/4
    jsEngine: 'jsc',
  },
  android: {
    icon: `./assets/icon-${appBuild}-android.png`,
    adaptiveIcon: {
      // foregroundImage: `./assets/icon-${appBuild}.png`,
      backgroundColor: '#FFFFFF',
    },
    package: `${appBundle}.${appBuild}`,
    versionCode: getAndroidVersionCode(semVer),
    googleServicesFile: (`./resources/firebase/google-services.json`),
    jsEngine: 'hermes',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  notification: {},
  plugins: [
    'sentry-expo',
    // FIXME: Type devmenu.com.swmansion.common.GestureHandlerStateManager is defined multiple times
    // newrelic-react-native-agent create duplication with vendored expo-dev-menu
    // > Task :app:transformClassesWithNewrelicTransformForDebug
    // cf. https://github.com/expo/expo/issues/18681
    ...(appBuild === 'preview' ? [] : ['newrelic-react-native-agent']),
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {},
        ios: {
          useFrameworks: 'static',
          // cannot use flipper with useFrameworks: 'static', needed by firebase
          // flipper: true,
        },
      },
    ],
    '@react-native-firebase/app',
    [path.resolve('./plugins/tmp-eas-android-build-plugin.js'],
  ],
  hooks: {
    postPublish: [
      SENTRY_AUTH_TOKEN && {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: SENTRY_ORGANIZATION,
          project: SENTRY_PROJECT,
          authToken: SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
});

function getAndroidVersionCode(semVer: SemVer) {
  if ([semVer.major, semVer.minor, semVer.patch].some((_) => _ > 999)) {
    throw new Error(
      'version should never have a number > 999 for android compatibility',
    );
  }
  return semVer.major * 1000000 + semVer.minor * 1000 + semVer.patch;
}

function getIosBuildNumber(semVer: SemVer) {
  return `${semVer.major}.${semVer.minor}.${semVer.patch}`;
}

function getVersion(semVer: SemVer) {
  return `${semVer.major}.${semVer.minor}`;
}
