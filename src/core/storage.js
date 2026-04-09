/**
 * Meridian Storage Abstraction Layer
 *
 * Modules call these functions. They never check ENV.TARGET.
 * Storage location is transparent to the caller.
 *
 * Local mode:  reads/writes JSON files in data/local/
 * Server mode: reads/writes PostgreSQL via pg pool
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import ENV from '../config/env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data/local');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ─── Local Storage Helpers ─────────────────────────────────────────────────────

function localRead(table) {
  const filePath = join(DATA_DIR, `${table}.json`);
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function localWrite(table, records) {
  const filePath = join(DATA_DIR, `${table}.json`);
  writeFileSync(filePath, JSON.stringify(records, null, 2));
}

// ─── Server Storage Helpers ────────────────────────────────────────────────────

let pool = null;

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg');
    pool = new Pool({
      connectionString: ENV.SERVER.DATABASE_URL,
      ssl: ENV.SERVER.SSL ? { rejectUnauthorized: false } : false,
      min: ENV.SERVER.POOL_MIN,
      max: ENV.SERVER.POOL_MAX
    });
  }
  return pool;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const storage = {

  /**
   * Get all records from a table
   * @param {string} table - Table/collection name
   * @param {object} filters - Key-value pairs to filter by
   */
  async getAll(table, filters = {}) {
    if (ENV.isLocal()) {
      let records = localRead(table);
      Object.entries(filters).forEach(([key, value]) => {
        records = records.filter(r => r[key] === value);
      });
      return records;
    }

    const db = await getPool();
    const keys = Object.keys(filters);
    if (keys.length === 0) {
      const result = await db.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
      return result.rows;
    }
    const conditions = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const result = await db.query(
      `SELECT * FROM ${table} WHERE ${conditions} ORDER BY created_at DESC`,
      Object.values(filters)
    );
    return result.rows;
  },

  /**
   * Get single record by ID
   */
  async getById(table, id) {
    if (ENV.isLocal()) {
      const records = localRead(table);
      return records.find(r => r.id === id) || null;
    }
    const db = await getPool();
    const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create a new record
   * Automatically adds id (uuid) and created_at if not provided
   */
  async create(table, data) {
    const record = {
      id: data.id || uuidv4(),
      created_at: data.created_at || new Date().toISOString(),
      ...data
    };

    if (ENV.isLocal()) {
      const records = localRead(table);
      records.push(record);
      localWrite(table, records);
      return record;
    }

    const db = await getPool();
    const keys = Object.keys(record);
    const values = Object.values(record).map(v =>
      typeof v === 'object' && v !== null ? JSON.stringify(v) : v
    );
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    const result = await db.query(
      `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Update an existing record by ID
   */
  async update(table, id, updates) {
    const updated = { ...updates, updated_at: new Date().toISOString() };

    if (ENV.isLocal()) {
      const records = localRead(table);
      const idx = records.findIndex(r => r.id === id);
      if (idx === -1) throw new Error(`Record ${id} not found in ${table}`);
      records[idx] = { ...records[idx], ...updated };
      localWrite(table, records);
      return records[idx];
    }

    const db = await getPool();
    const keys = Object.keys(updated);
    const values = Object.values(updated).map(v =>
      typeof v === 'object' && v !== null ? JSON.stringify(v) : v
    );
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await db.query(
      `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  /**
   * Delete a record by ID
   */
  async delete(table, id) {
    if (ENV.isLocal()) {
      const records = localRead(table);
      const filtered = records.filter(r => r.id !== id);
      localWrite(table, filtered);
      return { deleted: true, id };
    }
    const db = await getPool();
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return { deleted: true, id };
  },

  /**
   * Encrypted backup of all local data (.mrd file)
   * Server mode: generates a JSON dump instead
   */
  async backup(outputPath) {
    if (ENV.isLocal()) {
      const { subtle } = globalThis.crypto;
      const tables = ['organizations', 'users', 'events', 'org_health_signals', 'friction_log'];
      const dump = {};
      tables.forEach(t => { dump[t] = localRead(t); });

      const data = JSON.stringify({
        backup_date: new Date().toISOString(),
        version: ENV.APP_VERSION,
        data: dump
      });

      const key = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(data);
      const encrypted = await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
      const exportedKey = await subtle.exportKey('raw', key);

      const payload = {
        iv: Array.from(iv),
        key: Array.from(new Uint8Array(exportedKey)),
        data: Array.from(new Uint8Array(encrypted))
      };

      writeFileSync(outputPath, JSON.stringify(payload));
      return { success: true, path: outputPath };
    }
    // Server mode backup is handled by database tooling (pg_dump)
    return { success: false, message: 'Use pg_dump for server mode backups' };
  }
};

export default storage;
