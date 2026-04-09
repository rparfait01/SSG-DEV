/**
 * Meridian Environment Configuration — Browser Build
 *
 * Browser always runs in local mode. No filesystem access.
 * Vite aliases this file in place of env.js during browser builds.
 */

const ENV = {
  TARGET: 'local',
  APP_VERSION: '0.1.0',
  APP_NAME: 'Meridian by SSG',

  isLocal() { return true; },
  isServer() { return false; },
  getStorage() { return 'local'; },

  SERVER: {
    DATABASE_URL: '',
    SSL: false,
    POOL_MIN: 2,
    POOL_MAX: 10,
    PORT: 3001
  },

  AUTH: {
    SECRET: 'browser-local-only',
    EXPIRES_IN: '8h'
  },

  SSG_PUSH: {
    ENABLED: false,
    ENDPOINT: '',
    MIN_ORG_SIZE_FOR_PUSH: 10
  },

  LANGUAGES: ['en', 'es', 'pt', 'ja', 'zh'],

  ROLES: [
    'global_board',
    'executive_director',
    'regional_councillor',
    'regional_director',
    'senior_director',
    'chapter_president',
    'chapter_staff',
    'hr',
    'governance'
  ]
};

export default ENV;
