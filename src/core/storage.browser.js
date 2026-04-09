/**
 * Meridian Storage — Browser Build
 *
 * Uses localStorage as the backing store.
 * API is identical to storage.js — callers see no difference.
 * Vite aliases this file in place of storage.js during browser builds.
 */

const PREFIX = 'meridian_';

function readTable(table) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + table) || '[]');
  } catch {
    return [];
  }
}

function writeTable(table, records) {
  localStorage.setItem(PREFIX + table, JSON.stringify(records));
}

export const storage = {

  async getAll(table, filters = {}) {
    let records = readTable(table);
    Object.entries(filters).forEach(([key, value]) => {
      records = records.filter(r => r[key] === value);
    });
    return records;
  },

  async getById(table, id) {
    return readTable(table).find(r => r.id === id) || null;
  },

  async create(table, data) {
    const record = {
      id: data.id || crypto.randomUUID(),
      created_at: data.created_at || new Date().toISOString(),
      ...data
    };
    const records = readTable(table);
    records.push(record);
    writeTable(table, records);
    return record;
  },

  async update(table, id, updates) {
    const records = readTable(table);
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Record ${id} not found in ${table}`);
    records[idx] = { ...records[idx], ...updates, updated_at: new Date().toISOString() };
    writeTable(table, records);
    return records[idx];
  },

  async delete(table, id) {
    writeTable(table, readTable(table).filter(r => r.id !== id));
    return { deleted: true, id };
  },

  /**
   * Seed localStorage from the EO pilot JSON data.
   * Call once on first load if tables are empty.
   */
  async seedFromJson(tableDataMap) {
    for (const [table, records] of Object.entries(tableDataMap)) {
      if (readTable(table).length === 0 && records.length > 0) {
        writeTable(table, records);
      }
    }
  }
};

export default storage;
