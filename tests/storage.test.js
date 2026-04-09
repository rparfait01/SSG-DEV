import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Set to local mode for testing
process.env.TARGET = 'local';

// Dynamic import after setting env
let storage;
beforeEach(async () => {
  const mod = await import('../src/core/storage.js');
  storage = mod.storage || mod.default;
});

const TEST_TABLE = 'test_records';
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../data/local');

function cleanup() {
  const file = join(DATA_DIR, `${TEST_TABLE}.json`);
  if (existsSync(file)) unlinkSync(file);
}

beforeEach(() => {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  cleanup();
});

afterEach(() => {
  cleanup();
});

describe('storage.create', () => {
  it('creates a record and returns it with id and created_at', async () => {
    const record = await storage.create(TEST_TABLE, { name: 'Test', value: 42 });
    expect(record.id).toBeDefined();
    expect(record.created_at).toBeDefined();
    expect(record.name).toBe('Test');
    expect(record.value).toBe(42);
  });

  it('uses provided id if given', async () => {
    const record = await storage.create(TEST_TABLE, { id: 'custom-id', name: 'A' });
    expect(record.id).toBe('custom-id');
  });
});

describe('storage.getById', () => {
  it('returns the correct record by id', async () => {
    const created = await storage.create(TEST_TABLE, { name: 'FindMe' });
    const found = await storage.getById(TEST_TABLE, created.id);
    expect(found).not.toBeNull();
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('FindMe');
  });

  it('returns null for non-existent id', async () => {
    const found = await storage.getById(TEST_TABLE, 'does-not-exist');
    expect(found).toBeNull();
  });
});

describe('storage.getAll', () => {
  it('returns all records', async () => {
    await storage.create(TEST_TABLE, { tag: 'a' });
    await storage.create(TEST_TABLE, { tag: 'b' });
    const all = await storage.getAll(TEST_TABLE);
    expect(all.length).toBe(2);
  });

  it('returns only matching records when filters applied', async () => {
    await storage.create(TEST_TABLE, { org: 'eo', type: 'global' });
    await storage.create(TEST_TABLE, { org: 'eo', type: 'regional' });
    await storage.create(TEST_TABLE, { org: 'other', type: 'global' });

    const eo = await storage.getAll(TEST_TABLE, { org: 'eo' });
    expect(eo.length).toBe(2);

    const global = await storage.getAll(TEST_TABLE, { org: 'eo', type: 'global' });
    expect(global.length).toBe(1);
  });

  it('returns empty array for table with no records', async () => {
    const all = await storage.getAll(TEST_TABLE);
    expect(all).toEqual([]);
  });
});

describe('storage.update', () => {
  it('merges changes correctly', async () => {
    const created = await storage.create(TEST_TABLE, { name: 'Before', status: 'draft' });
    const updated = await storage.update(TEST_TABLE, created.id, { status: 'complete' });
    expect(updated.status).toBe('complete');
    expect(updated.name).toBe('Before');
  });

  it('adds updated_at timestamp', async () => {
    const created = await storage.create(TEST_TABLE, { name: 'A' });
    const updated = await storage.update(TEST_TABLE, created.id, { name: 'B' });
    expect(updated.updated_at).toBeDefined();
  });

  it('throws for non-existent record', async () => {
    await expect(
      storage.update(TEST_TABLE, 'fake-id', { name: 'X' })
    ).rejects.toThrow();
  });
});

describe('storage.delete', () => {
  it('removes the record', async () => {
    const created = await storage.create(TEST_TABLE, { name: 'ToDelete' });
    await storage.delete(TEST_TABLE, created.id);
    const found = await storage.getById(TEST_TABLE, created.id);
    expect(found).toBeNull();
  });

  it('returns deleted: true with the id', async () => {
    const created = await storage.create(TEST_TABLE, { name: 'X' });
    const result = await storage.delete(TEST_TABLE, created.id);
    expect(result.deleted).toBe(true);
    expect(result.id).toBe(created.id);
  });
});
