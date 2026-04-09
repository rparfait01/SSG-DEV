/**
 * Meridian Environment Configuration
 *
 * Single source of truth for all environment-dependent settings.
 * Modules NEVER read process.env directly — they call ENV methods.
 * The single switch: TARGET = "local" | "server"
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present (local dev)
function loadDotEnv() {
  const envPath = join(__dirname, '../../.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const TARGET = process.env.TARGET || 'local';

const ENV = {
  TARGET,
  APP_VERSION: '0.1.0',
  APP_NAME: 'Meridian by SSG',

  isLocal() {
    return this.TARGET === 'local';
  },

  isServer() {
    return this.TARGET === 'server';
  },

  getStorage() {
    return this.TARGET;
  },

  SERVER: {
    DATABASE_URL: process.env.DATABASE_URL || '',
    SSL: process.env.NODE_ENV === 'production',
    POOL_MIN: 2,
    POOL_MAX: 10,
    PORT: parseInt(process.env.PORT || '3001', 10)
  },

  AUTH: {
    SECRET: process.env.JWT_SECRET || 'dev-secret-replace-in-production',
    EXPIRES_IN: '8h'
  },

  SSG_PUSH: {
    ENABLED: !!(process.env.SSG_PUSH_ENDPOINT),
    ENDPOINT: process.env.SSG_PUSH_ENDPOINT || '',
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
