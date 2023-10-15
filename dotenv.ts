// import only to run extract but prevent to use variables directly in this app
import extract from 'dotenv-extract';

export const APP_BUILD = extract({
  name: 'APP_BUILD',
  patterns: ['preview', 'release'],
  default: 'preview',
});

if (APP_ENV !== 'production' && APP_BUILD === 'release') {
  throw new Error(
    `APP_BUILD=release is only allowed in production environment: APP_ENV=${APP_ENV}`,
  );
}

export const APP_BUNDLE = extract({
	name: 'APP_BUNDLE',
	patterns: [':alphanum:.:alphanum:(.:alphanum:)?'],
})

export const APP_NAME = extract({
	name: 'APP_NAME',
	patterns: [':alphanum:']
})

// New Relic
export const NEWRELIC_IOS_TOKEN = extract({
  name: 'NEWRELIC_IOS_TOKEN',
});

export const NEWRELIC_ANDROID_TOKEN = extract({
  name: 'NEWRELIC_ANDROID_TOKEN',
});

// Sentry
export const SENTRY_ORGANIZATION = extract({
	name: "SENTRY_ORGANIZATION",
})

export const SENTRY_PROJECT = extract({
	name: "SENTRY_PROJECT",
})

export const SENTRY_AUTH_TOKEN = extract({
  name: 'SENTRY_AUTH_TOKEN',
});

export const SENTRY_DSN = extract({
  name: 'SENTRY_DSN',
});

// Must never be true
export const EXPO_USE_LOCAL_CLI = extract({
  name: 'EXPO_USE_LOCAL_CLI',
  optional: true,
  patterns: ['false'] as const,
});

export const EXPO_PROJECT_ID = extract({
	name: "EXPO_PROJECT_ID",
})
