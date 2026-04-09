# MERIDIAN — CLAUDE CODE BUILD GUIDANCE
### Complete Implementation Guide: Phase 1 through Server Deployment
**by Summit Strategies Group LLC**
Document Version: 1.0 | For use with Claude Code

---

## PREFACE FOR CLAUDE CODE

You are building **Meridian by SSG** — an organizational health and readiness platform. This is not a task manager. It is a diagnostic and planning system built on the CLR Framework (Conditioning-Legitimacy Response), a validated theoretical framework developed by Royce Parfait.

**Read this entire document before writing a single line of code.**

The foundation files already exist:
- `/meridian/README.md` — product philosophy and architecture
- `/meridian/data/schemas/master.schema.json` — the data contract (do not deviate from this)
- `/meridian/src/config/env.js` — single-switch deploy config
- `/meridian/scripts/migrate.js` — JSON → PostgreSQL migration
- `/meridian/docs/DATA_GOVERNANCE.md` — what data moves and what doesn't
- `/meridian/docs/BACKLOG.md` — phased build sequence

**Core constraints that govern every decision:**

1. **Operators operate. Engineers engineer.** The UI must be simple enough that any user at any role level can operate it immediately with zero training. Complexity belongs in the calculation engine and schema — never in the interface.

2. **USD is the storage currency.** All monetary values are stored as integer USD cents. Display conversion to any of the 18 supported currencies happens only at the presentation layer. Never store non-USD values.

3. **Schema is the transport contract.** `master.schema.json` defines every data shape. Local JSON storage and PostgreSQL server storage both conform to these exact shapes. Do not introduce new fields without updating the schema.

4. **Local-first, server-ready.** The app runs entirely without a network connection in local mode. The single switch `TARGET` in `env.js` moves it to server mode. No module should ever check `TARGET` directly — they call `ENV.getStorage()`.

5. **SSG data push is aggregate only.** Individual records never leave the client instance. Only anonymized health signals push to SSG. See `DATA_GOVERNANCE.md`.

6. **EO is Pilot Client 01.** Everything built is generic and licensable to any organization. EO-specific configuration lives in `/client/eo-pilot/` — not in core modules.

---

## TECHNOLOGY STACK

### Required
```
Node.js >= 18.0.0
npm >= 9.0.0
```

### Core Dependencies (install first)
```bash
npm init -y
npm install express cors helmet dotenv uuid
npm install better-sqlite3          # local storage fallback
npm install pg pg-pool               # PostgreSQL for server mode
npm install bcryptjs jsonwebtoken    # auth
npm install react react-dom          # UI
npm install vite @vitejs/plugin-react # build tooling
npm install react-router-dom         # routing
npm install recharts                 # health dashboard charts
npm install date-fns                 # date handling
npm install jspdf jspdf-autotable    # PDF export
```

### Dev Dependencies
```bash
npm install -D eslint prettier vitest @testing-library/react
```

### Project Structure to Build
```
meridian/
├── README.md                    (EXISTS)
├── package.json                 (CREATE)
├── vite.config.js               (CREATE)
├── .env.example                 (CREATE)
├── .gitignore                   (CREATE)
│
├── src/
│   ├── config/
│   │   └── env.js               (EXISTS)
│   ├── core/
│   │   ├── storage.js           (CREATE — storage abstraction layer)
│   │   ├── api.js               (CREATE — REST API server)
│   │   ├── auth.js              (CREATE — role-based auth)
│   │   └── push.js              (CREATE — SSG health signal push)
│   ├── modules/
│   │   ├── event-planner/       (CREATE — Phase 1)
│   │   ├── org-health/          (CREATE — Phase 3)
│   │   ├── friction-log/        (CREATE — Phase 3)
│   │   ├── rhythm-board/        (CREATE — Phase 2)
│   │   └── orra-lite/           (CREATE — Phase 3)
│   ├── ui/
│   │   ├── App.jsx              (CREATE)
│   │   ├── components/          (CREATE — shared components)
│   │   ├── dashboards/          (CREATE — role-specific views)
│   │   └── styles/              (CREATE — SSG brand tokens)
│   └── utils/
│       ├── currency.js          (CREATE — conversion utilities)
│       ├── calculations.js      (CREATE — budget math engine)
│       └── validators.js        (CREATE — input validation)
│
├── data/
│   ├── schemas/
│   │   └── master.schema.json   (EXISTS)
│   ├── local/                   (CREATE — local JSON storage)
│   ├── backups/                 (CREATE — encrypted .mrd files)
│   ├── migrations/
│   │   └── output/              (CREATE — generated SQL)
│   └── seeds/
│       └── eo-pilot.seed.js     (CREATE — EO pilot config)
│
├── scripts/
│   └── migrate.js               (EXISTS)
│
├── docs/
│   ├── BACKLOG.md               (EXISTS)
│   └── DATA_GOVERNANCE.md       (EXISTS)
│
├── client/
│   └── eo-pilot/
│       └── config.json          (CREATE — EO-specific config)
│
└── tests/
    ├── currency.test.js         (CREATE)
    ├── calculations.test.js     (CREATE)
    └── storage.test.js          (CREATE)
```

---

## PHASE 0 — PROJECT INITIALIZATION

### Step 0.1 — package.json
```json
{
  "name": "meridian-ssg",
  "version": "0.1.0",
  "description": "Meridian by SSG — Organizational Health and Readiness Platform",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node src/core/api.js",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\"",
    "test": "vitest",
    "migrate": "node scripts/migrate.js",
    "seed": "node data/seeds/eo-pilot.seed.js"
  }
}
```

### Step 0.2 — .env.example
```
# Copy to .env and fill in values
# Never commit .env to version control

# Deployment target: "local" or "server"
TARGET=local

# Required for server mode only
DATABASE_URL=postgresql://user:password@host:5432/meridian

# Auth secret — change before any deployment
JWT_SECRET=replace-this-with-a-random-256-bit-string

# SSG health push endpoint — leave blank until activated
SSG_PUSH_ENDPOINT=

# Node environment
NODE_ENV=development
```

### Step 0.3 — .gitignore
```
node_modules/
dist/
.env
data/local/*.json
data/backups/
data/migrations/output/
*.mrd
```

### Step 0.4 — vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

---

## PHASE 1 — STORAGE ABSTRACTION LAYER

**File: `src/core/storage.js`**

This is the most critical core file. Every module reads and writes through this layer. It is the only file that knows whether it is talking to local JSON files or a PostgreSQL database. Modules never touch the filesystem or database directly.

```javascript
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
```

---

## PHASE 1 — CURRENCY UTILITIES

**File: `src/utils/currency.js`**

All currency math lives here. Nothing else does currency math.

```javascript
/**
 * Meridian Currency Utilities
 * 
 * RULE: All values are stored as integer USD cents.
 *       Conversion to display currency happens HERE, at output only.
 *       Input from users in non-USD currencies is converted TO cents immediately on entry.
 * 
 * Why cents? Floating point arithmetic on decimals produces errors.
 * $10.50 + $0.10 = $10.600000000001 in float. 1050 + 10 = 1060 in integer. Always correct.
 */

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          symbol: '$',    region: 'United States' },
  { code: 'CNY', name: 'Chinese Yuan',        symbol: '¥',    region: 'China' },
  { code: 'JPY', name: 'Japanese Yen',        symbol: '¥',    region: 'Japan' },
  { code: 'KRW', name: 'South Korean Won',    symbol: '₩',    region: 'South Korea' },
  { code: 'EUR', name: 'Euro',                symbol: '€',    region: 'Europe' },
  { code: 'ZAR', name: 'South African Rand',  symbol: 'R',    region: 'South Africa' },
  { code: 'BRL', name: 'Brazilian Real',      symbol: 'R$',   region: 'Brazil' },
  { code: 'MXN', name: 'Mexican Peso',        symbol: '$',    region: 'Mexico' },
  { code: 'CAD', name: 'Canadian Dollar',     symbol: '$',    region: 'Canada' },
  { code: 'SGD', name: 'Singapore Dollar',    symbol: '$',    region: 'Singapore' },
  { code: 'THB', name: 'Thai Baht',           symbol: '฿',    region: 'Thailand' },
  { code: 'PHP', name: 'Philippine Peso',     symbol: '₱',    region: 'Philippines' },
  { code: 'AUD', name: 'Australian Dollar',   symbol: '$',    region: 'Australia' },
  { code: 'NZD', name: 'New Zealand Dollar',  symbol: '$',    region: 'New Zealand' },
  { code: 'PKR', name: 'Pakistani Rupee',     symbol: '₨',    region: 'Pakistan' },
  { code: 'AED', name: 'UAE Dirham',          symbol: 'د.إ',  region: 'UAE' },
  { code: 'QAR', name: 'Qatari Riyal',        symbol: 'ر.ق',  region: 'Qatar' },
  { code: 'TRY', name: 'Turkish Lira',        symbol: '₺',    region: 'Turkey' }
];

/**
 * Convert a user-entered dollar amount (string or number) to USD cents (integer)
 * Input: "1,250.50" or 1250.50 or "¥150,000" (with rate provided)
 * Output: 125050 (integer cents)
 */
export function toCents(amount, exchangeRate = 1.0) {
  if (amount === null || amount === undefined || amount === '') return 0;
  const cleaned = String(amount).replace(/[^0-9.]/g, '');
  const float = parseFloat(cleaned) || 0;
  const usd = float / exchangeRate;
  return Math.round(usd * 100);
}

/**
 * Convert USD cents (integer) to display amount in target currency
 * Input:  125050 cents, rate 150.0 (USD/JPY), 'JPY'
 * Output: "¥187,575"
 */
export function fromCents(cents, exchangeRate = 1.0, currencyCode = 'USD') {
  if (!cents) return formatCurrency(0, currencyCode);
  const usd = cents / 100;
  const displayAmount = usd * exchangeRate;
  return formatCurrency(displayAmount, currencyCode);
}

/**
 * Format a number as currency display string
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || '$';
  
  // Currencies with no decimal places
  const noDecimal = ['JPY', 'KRW'];
  const decimals = noDecimal.includes(currencyCode) ? 0 : 2;
  
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${symbol}${formatted}`;
}

/**
 * Sum an array of cent values safely
 */
export function sumCents(centValues) {
  return centValues.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
}

/**
 * Get currency metadata by code
 */
export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}
```

---

## PHASE 1 — BUDGET CALCULATION ENGINE

**File: `src/utils/calculations.js`**

This is the math engine. It takes an event object and returns a fully calculated budget summary. It is pure — no side effects, no storage calls. Input → Output.

```javascript
/**
 * Meridian Budget Calculation Engine
 * 
 * Pure functions. No side effects. No storage calls.
 * Input: event object with raw cent values
 * Output: budget_summary with all totals calculated
 * 
 * Called every time any budget field changes.
 * The UI displays the output. The UI never does math.
 */

import { sumCents } from './currency.js';

/**
 * Calculate venue total
 */
function calcVenue(venue) {
  if (!venue) return 0;
  const supportTotal = sumCents(
    (venue.support_costs || []).map(c => c.cost_usd_cents)
  );
  return sumCents([venue.rental_cost_usd_cents, supportTotal]);
}

/**
 * Calculate lodging total
 * rooms × nights × rate = total
 */
function calcLodging(lodging) {
  if (!lodging) return 0;
  const rooms = parseInt(lodging.rooms_reserved) || 0;
  const nights = parseInt(lodging.nights) || 0;
  const rate = parseInt(lodging.cost_per_room_per_night_usd_cents) || 0;
  return rooms * nights * rate;
}

/**
 * Calculate airfare total
 * Each group: travelers × cost_per_person = subtotal
 */
function calcAirfare(airfare) {
  if (!airfare?.groups) return 0;
  const groupTotals = airfare.groups.map(g => {
    const count = parseInt(g.traveler_count) || 0;
    const cost = parseInt(g.cost_per_person_usd_cents) || 0;
    return count * cost;
  });
  return sumCents(groupTotals);
}

/**
 * Calculate per diem totals
 * Each category: headcount × days × daily_rate = total
 */
function calcPerDiem(perDiem) {
  if (!perDiem) return 0;
  
  const staffTotal = (() => {
    const s = perDiem.staff;
    if (!s) return 0;
    return (parseInt(s.headcount) || 0) * (parseInt(s.days) || 0) * (parseInt(s.daily_rate_usd_cents) || 0);
  })();
  
  const supportTotal = (() => {
    const s = perDiem.support_personnel;
    if (!s) return 0;
    return (parseInt(s.headcount) || 0) * (parseInt(s.days) || 0) * (parseInt(s.daily_rate_usd_cents) || 0);
  })();
  
  return staffTotal + supportTotal;
}

/**
 * Calculate translation total
 * Each translator: days × rate_per_day = subtotal
 * Also returns per-translator calculated subtotals for display
 */
function calcTranslation(translation) {
  if (!translation?.translators) return { total: 0, translators: [] };
  
  const translators = translation.translators.map(t => {
    const days = parseInt(t.days) || 0;
    const rate = parseInt(t.rate_per_day_usd_cents) || 0;
    const subtotal = days * rate;
    return { ...t, subtotal_usd_cents: subtotal };
  });
  
  const total = sumCents(translators.map(t => t.subtotal_usd_cents));
  return { total, translators };
}

/**
 * Calculate materials total
 */
function calcMaterials(materials) {
  if (!materials?.cost_lines) return 0;
  return sumCents(materials.cost_lines.map(c => c.cost_usd_cents));
}

/**
 * Calculate support requirements total
 */
function calcSupport(supportRequirements) {
  if (!supportRequirements?.cost_lines) return 0;
  return sumCents(supportRequirements.cost_lines.map(c => c.cost_usd_cents));
}

/**
 * MAIN CALCULATION FUNCTION
 * Call this any time event data changes.
 * Returns updated event with all totals calculated.
 */
export function calculateEventBudget(event) {
  const venueTotalCents        = calcVenue(event.venue);
  const lodgingTotalCents      = calcLodging(event.lodging);
  const airfareTotalCents      = calcAirfare(event.airfare);
  const perDiemTotalCents      = calcPerDiem(event.per_diem);
  const { total: translationTotalCents, translators: calcedTranslators } = calcTranslation(event.translation);
  const materialsTotalCents    = calcMaterials(event.materials);
  const supportTotalCents      = calcSupport(event.support_requirements);

  const grandTotalCents = sumCents([
    venueTotalCents,
    lodgingTotalCents,
    airfareTotalCents,
    perDiemTotalCents,
    translationTotalCents,
    materialsTotalCents,
    supportTotalCents
  ]);

  const rate = parseFloat(event.usd_exchange_rate) || 1.0;

  return {
    ...event,
    translation: event.translation
      ? { ...event.translation, translators: calcedTranslators, total_usd_cents: translationTotalCents }
      : event.translation,
    budget_summary: {
      venue_total_usd_cents:       venueTotalCents,
      lodging_total_usd_cents:     lodgingTotalCents,
      airfare_total_usd_cents:     airfareTotalCents,
      per_diem_total_usd_cents:    perDiemTotalCents,
      translation_total_usd_cents: translationTotalCents,
      materials_total_usd_cents:   materialsTotalCents,
      support_total_usd_cents:     supportTotalCents,
      grand_total_usd_cents:       grandTotalCents,
      grand_total_display:         (grandTotalCents / 100) * rate,
      last_calculated:             new Date().toISOString()
    }
  };
}

/**
 * Cross-section push logic:
 * When a translator row has travel_required = true,
 * ensure an airfare group exists for that translator.
 * When lodging_required = true, increment lodging room count.
 * 
 * Call this after any translator change.
 */
export function syncTranslatorDependencies(event) {
  if (!event.translation?.translators) return event;
  
  let updatedEvent = { ...event };
  
  event.translation.translators.forEach(translator => {
    // Sync airfare
    if (translator.travel_required && translator.id) {
      const groups = updatedEvent.airfare?.groups || [];
      const existing = groups.find(g => g.id === translator.airfare_group_id);
      
      if (!existing) {
        const newGroup = {
          id: translator.id + '_air',
          group_type: 'translator',
          traveler_count: 1,
          class: 'economy',
          cost_per_person_usd_cents: 0,
          subtotal_usd_cents: 0,
          notes: `Auto-generated for translator: ${translator.name}`
        };
        updatedEvent = {
          ...updatedEvent,
          airfare: {
            ...updatedEvent.airfare,
            groups: [...groups, newGroup]
          }
        };
      }
    }
  });
  
  return updatedEvent;
}
```

---

## PHASE 1 — AUTH MODULE

**File: `src/core/auth.js`**

Local mode uses simple role selection (pilot/dev). Server mode uses JWT. The interface is identical to callers.

```javascript
/**
 * Meridian Auth Module
 * 
 * Local mode:  Simple role selection — no passwords in pilot phase
 * Server mode: JWT + bcrypt, role-based access control
 * 
 * Permission matrix mirrors master.schema.json ROLES definition.
 */

import ENV from '../config/env.js';

// Role permission definitions
// Mirrors ENV.ROLES — single source of truth
export const PERMISSIONS = {
  global_board: {
    track: 'volunteer',
    tier: 1,
    can_see_finance: ['global-read'],
    can_deploy_instruments: ['orra-oversight', 'plh-oversight'],
    sees_above: null,
    sees_below: 'regional_councillor'
  },
  executive_director: {
    track: 'staff',
    tier: 1,
    can_see_finance: ['global-full'],
    can_deploy_instruments: ['orra', 'orra-lite', 'plh', 'sli', 'mentorship'],
    sees_above: null,
    sees_below: 'regional_director'
  },
  regional_councillor: {
    track: 'volunteer',
    tier: 2,
    can_see_finance: ['regional-read'],
    can_deploy_instruments: ['orra-lite-trigger'],
    sees_above: 'global_board',
    sees_below: 'chapter_president'
  },
  regional_director: {
    track: 'staff',
    tier: 2,
    can_see_finance: ['regional-full'],
    can_deploy_instruments: ['orra-lite', 'sli', 'mentorship'],
    sees_above: 'executive_director',
    sees_below: 'chapter_staff'
  },
  senior_director: {
    track: 'staff',
    tier: 2,
    can_see_finance: ['regional-full'],
    can_deploy_instruments: ['orra-lite', 'sli', 'mentorship'],
    sees_above: 'executive_director',
    sees_below: 'chapter_staff'
  },
  chapter_president: {
    track: 'volunteer',
    tier: 3,
    can_see_finance: ['chapter-read'],
    can_deploy_instruments: ['mentorship'],
    sees_above: 'regional_councillor',
    sees_below: 'chapter_staff'
  },
  chapter_staff: {
    track: 'staff',
    tier: 3,
    can_see_finance: [],
    can_deploy_instruments: [],
    sees_above: 'regional_director',
    sees_below: null
  },
  hr: {
    track: 'staff',
    tier: 0,
    can_see_finance: [],
    can_deploy_instruments: ['orra-lite', 'plh', 'training'],
    sees_above: 'executive_director',
    sees_below: 'all-staff'
  },
  governance: {
    track: 'mixed',
    tier: 0,
    can_see_finance: [],
    can_deploy_instruments: ['orra-cycle'],
    sees_above: 'global_board',
    sees_below: 'all-levels'
  }
};

/**
 * Check if a role can perform an action
 */
export function can(role, action) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  
  switch (action) {
    case 'view_global_finance':    return perms.can_see_finance.includes('global-full') || perms.can_see_finance.includes('global-read');
    case 'edit_global_finance':    return perms.can_see_finance.includes('global-full');
    case 'view_regional_finance':  return perms.can_see_finance.some(f => f.startsWith('regional') || f.startsWith('global'));
    case 'edit_regional_finance':  return perms.can_see_finance.includes('regional-full') || perms.can_see_finance.includes('global-full');
    case 'view_chapter_finance':   return perms.can_see_finance.length > 0;
    case 'deploy_orra':            return perms.can_deploy_instruments.includes('orra');
    case 'deploy_orra_lite':       return perms.can_deploy_instruments.some(i => i.startsWith('orra'));
    case 'deploy_plh':             return perms.can_deploy_instruments.includes('plh') || perms.can_deploy_instruments.includes('orra-lite-plh');
    case 'deploy_sli':             return perms.can_deploy_instruments.includes('sli');
    case 'create_event':           return perms.tier <= 2;
    case 'approve_event':          return perms.tier <= 1 || perms.track === 'staff' && perms.tier <= 2;
    case 'view_health_dashboard':  return true;
    case 'view_friction_log':      return true;
    case 'log_friction':           return perms.track === 'staff';
    case 'hr_actions':             return role === 'hr';
    case 'governance_actions':     return role === 'governance';
    default: return false;
  }
}

/**
 * Local mode: create a session object from role selection
 * Server mode: validate JWT and return session
 */
export async function createSession(roleOrToken, organizationId = null) {
  if (ENV.isLocal()) {
    // Local pilot: trust the role selection
    const role = roleOrToken;
    if (!PERMISSIONS[role]) throw new Error(`Unknown role: ${role}`);
    return {
      id: `local-${role}`,
      role,
      organization_id: organizationId || 'eo-pilot-001',
      track: PERMISSIONS[role].track,
      permissions: PERMISSIONS[role],
      local_session: true
    };
  }
  
  // Server mode: validate JWT
  const jwt = await import('jsonwebtoken');
  try {
    const decoded = jwt.default.verify(roleOrToken, ENV.AUTH.SECRET);
    return { ...decoded, local_session: false };
  } catch {
    throw new Error('Invalid or expired session');
  }
}

/**
 * Dashboard type for a given role
 * Volunteer roles get lighter, directional dashboards
 * Staff roles get operational, execution-dense dashboards
 */
export function getDashboardType(role) {
  return PERMISSIONS[role]?.track === 'volunteer' ? 'volunteer' : 'staff';
}
```

---

## PHASE 1 — EVENT PLANNER MODULE

**Directory: `src/modules/event-planner/`**

Build the following files:

### `src/modules/event-planner/EventPlanner.jsx`

This is the main Event Planner component. It is the first module a user interacts with.

**Requirements:**
- Eight collapsible sections matching the spec: Event Identity, Venue, Lodging, Airfare, Per Diem, Translation, Materials, Support Requirements
- Live budget calculation: every input change triggers `calculateEventBudget()` from `calculations.js`. The grand total updates in real time.
- Currency selector: dropdown at the top showing all 18 currencies from `currency.js`. Selecting a non-USD currency shows a rate input field. The USD storage values never change — only the display converts.
- Event type toggle (Global / Regional / Chapter): selecting Global auto-checks all 5 languages in the Translation section. Regional/Chapter leaves language selection manual.
- Translator cross-section logic: each translator row has "Travel required" and "Lodging required" checkboxes. When checked, the Airfare section shows a new auto-generated group for that translator, and the Lodging total adjusts.
- Save as draft: saves the full event object to storage via `storage.create('events', event)` or `storage.update('events', id, event)`.
- Export to PDF: generates a clean budget summary PDF using jsPDF. The PDF shows: event name, type, dates, all section subtotals, grand total in display currency, and a timestamp. SSG logo at top.

**State shape:**
```javascript
const [event, setEvent] = useState({
  id: null,
  name: '',
  type: 'global',
  status: 'draft',
  start_date: '',
  end_date: '',
  duration_days: 0,
  display_currency: 'USD',
  usd_exchange_rate: 1.0,
  regions_supporting: [],
  translation_required: false,
  languages_required: ['en', 'es', 'pt', 'ja', 'zh'],
  venue: { name: '', city: '', country: '', rental_cost_usd_cents: 0, deposit_usd_cents: 0, deposit_due_date: '', support_costs: [] },
  lodging: { property_name: '', room_type: 'standard', rooms_reserved: 0, nights: 0, cost_per_room_per_night_usd_cents: 0, total_usd_cents: 0, includes_translator_lodging: false },
  airfare: { groups: [], total_usd_cents: 0 },
  per_diem: { staff: { daily_rate_usd_cents: 0, headcount: 0, days: 0, total_usd_cents: 0 }, support_personnel: { daily_rate_usd_cents: 0, headcount: 0, days: 0, total_usd_cents: 0 }, total_usd_cents: 0 },
  translation: { translators: [], total_usd_cents: 0 },
  materials: { selected_items: [], cost_lines: [], total_usd_cents: 0 },
  support_requirements: { selected_items: [], cost_lines: [], total_usd_cents: 0 },
  budget_summary: {}
});
```

**Update pattern — use this consistently:**
```javascript
function updateEvent(path, value) {
  setEvent(prev => {
    const updated = deepSet(prev, path, value);        // deepSet is a utility you write
    const withCalc = calculateEventBudget(updated);    // recalculate everything
    const withSync = syncTranslatorDependencies(withCalc); // sync cross-section dependencies
    return withSync;
  });
}
// Example: updateEvent('venue.rental_cost_usd_cents', toCents(inputValue, exchangeRate))
```

### `src/modules/event-planner/sections/` — Individual section components

Build each of the eight sections as a separate component:
- `SectionEventIdentity.jsx`
- `SectionVenue.jsx`
- `SectionLodging.jsx`
- `SectionAirfare.jsx`
- `SectionPerDiem.jsx`
- `SectionTranslation.jsx`
- `SectionMaterials.jsx`
- `SectionSupport.jsx`

Each section receives: `event`, `updateEvent`, `displayCurrency`, `exchangeRate`, `fromCents` (for display).

### Materials library (hardcoded constants)
```javascript
export const MATERIALS_LIBRARY = {
  name_badges:         'Name badges (standard lanyard + insert)',
  badge_holders:       'Badge holders / lanyards',
  printed_agenda:      'Printed event program / agenda',
  signage_directional: 'Branded signage — directional',
  signage_stage:       'Branded signage — stage / backdrop',
  banners_retractable: 'Pull-up / retractable banners',
  signage_registration:'Welcome / registration table signage',
  table_runners:       'Branded table runners / linens',
  printed_workbooks:   'Printed workbooks / session materials',
  notepads_branded:    'Notepads + pens (branded)',
  speaker_placards:    'Speaker placards / tent cards',
  certificates:        'Certificate / credential printing',
  glc_training_packets:'GLC role-based training packets',
  member_swag:         'Member gift / swag bag',
  photo_releases:      'Photography release / consent forms',
  translated_materials:'Translated materials (per language)'
};
```

### Support library (hardcoded constants)
```javascript
export const SUPPORT_LIBRARY = {
  photographer:           'Event photographer',
  videographer:           'Videographer / livestream crew',
  interpretation_equip:   'Simultaneous interpretation equipment',
  event_mc:               'Event MC / facilitator (external)',
  keynote_speaker:        'Keynote speaker (paid)',
  keynote_travel:         'Keynote speaker travel & lodging',
  panel_moderator:        'Panel moderator',
  registration_staff:     'Registration / check-in staff',
  transport_airport:      'Ground transportation (airport transfers)',
  transport_local:        'Local transportation (shuttle, bus)',
  learn_around:           'Learn Around / offsite excursion coordination',
  spouse_programming:     'Spouse / life partner programming',
  childcare:              'Childcare / family programming',
  cultural_experience:    'Cultural experience / host city immersion',
  it_support:             'IT / connectivity support on-site',
  medical_standby:        'Medical / first aid standby',
  security:               'Security detail',
  volunteer_coordination: 'Volunteer coordination',
  forum_room_setup:       'Member forum / small group room setup',
  glc_facilitation:       'GLC chapter officer track facilitation',
  accelerator_support:    'EO Accelerator track support',
  gsea_coordination:      'GSEA coordination on-site'
};
```

---

## PHASE 2 — ROLE DASHBOARD SCAFFOLD

**Directory: `src/ui/dashboards/`**

### `src/ui/dashboards/DashboardRouter.jsx`

On app load in local mode, show a role selector screen. The selected role determines which dashboard template loads. In server mode, JWT claims determine the role — skip the selector.

```jsx
// Role selector for local/pilot mode
// Shows all 9 roles with their track label (volunteer / staff)
// Selecting a role calls createSession(role) and routes to the appropriate dashboard
```

### `src/ui/dashboards/VolunteerDashboard.jsx`

For roles: global_board, regional_councillor, chapter_president.

**Layout principle:** Read-heavy. No task queues. No execution tracking. Three panels:
1. **Direction panel** — current objectives from the level above (read only)
2. **Health signal panel** — org health indicators for their scope (LHI score, readiness output, friction trend — no raw data)
3. **Rhythm panel** — upcoming events and milestones for their level

Finance panel: visible if role has finance read access, shows budget totals only (no line items).

Instrument access: shows available instrument triggers (ORRA-Lite, PLH) as simple action buttons if the role has deploy authority.

### `src/ui/dashboards/StaffDashboard.jsx`

For roles: executive_director, regional_director, senior_director, chapter_staff.

**Layout principle:** Operational density. Four panels:
1. **Directive panel** — tasks and objectives from level above
2. **Health & friction panel** — full health signals + friction log access
3. **Finance panel** — full budget visibility within scope
4. **Instrument panel** — ORRA-Lite launcher, SLI deploy, PLH trigger

### `src/ui/dashboards/HRDashboard.jsx`

Lateral visibility. No finance. Full instrument access for training and reframing. Special view: active friction flags across all levels with HR-action queue.

### `src/ui/dashboards/GovernanceDashboard.jsx`

Lateral visibility. No finance. ORRA cycle trigger authority. Compliance and dispute flag view. Read access to all levels.

---

## PHASE 3 — ORG HEALTH MODULES

### Friction Log — `src/modules/friction-log/`

**`FrictionLog.jsx`** — Two views toggled by a tab:

*Capture view:*
- Date (default today)
- Category selector: Process / Communication / Authority / Resource / Interpersonal / Structural
- Description (free text, 500 char limit)
- Severity: Low / Medium / High / Critical
- Submit → `storage.create('friction_log', entry)`

*Pattern view:*
- Last 30 / 60 / 90 days toggle
- Friction density: events per period (number display)
- Category breakdown: horizontal bar chart using Recharts
- Severity distribution: simple count by severity level
- Resolution rate: resolved/total as percentage
- No individual record display in the pattern view — aggregate only

### ORRA-Lite — `src/modules/orra-lite/`

**`OrraLite.jsx`** — Rapid 12-item organizational diagnostic.

The 12 items map to the Seed-Soil-Farmer model (4 items per layer):

*Farmer layer (leadership):*
1. Leadership decisions are consistent with stated values
2. Accountability is applied equally regardless of seniority
3. Leaders recognize and develop capability below their level
4. Communication from leadership is clear and timely

*Soil layer (environment):*
5. Processes support the work rather than obstruct it
6. Role clarity is sufficient — people know what they own
7. Resources are available when needed
8. Information flows to where decisions are made

*Seed layer (individual):*
9. People have the skills needed for their current responsibilities
10. New members integrate into the team effectively
11. Performance expectations are understood
12. Individual contributions are recognized

Each item: 5-point Likert scale (Strongly Disagree → Strongly Agree).

Scoring:
- Farmer score: average of items 1-4, × 25 = 0-100
- Soil score: average of items 5-8, × 25 = 0-100
- Seed score: average of items 9-12, × 25 = 0-100
- LHI composite: (Farmer × 0.5) + (Soil × 0.35) + (Seed × 0.15) = 0-100
  (Farmer weighted highest — consistent with Seed-Soil-Farmer model: farmer causes first)

Results display:
- Three scores with visual bar
- LHI composite prominently displayed
- Readiness output: Grounded (LHI ≥ 70), Rebuilding (LHI 45-69), Scattered (LHI < 45)
- Do NOT display individual responses or link scores to respondents
- Save aggregate result to `org_health_signals` table

### PLH Assessment — `src/modules/plh-assessment/`

**`PlhAssessment.jsx`** — Five HFP condition measurement.

Five conditions from the HFP model:
- Safety (institutional safety, not physical)
- Identity (role clarity and self-concept stability)
- Agency (sense of meaningful control)
- Connection (relational quality within the institution)
- Contribution (sense of purposeful impact)

4 items per condition = 20 items total. 5-point Likert.

Scoring: each condition scored 0-1 (average of 4 items / 4). Display as five bars.

This is individual-level data. It NEVER pushes to SSG. It saves locally with the user_id. Aggregate distribution (not individual scores) may appear on the health dashboard if org size ≥ 10.

---

## PHASE 3 — RHYTHM BOARD MODULE

**`src/modules/rhythm-board/RhythmBoard.jsx`**

Simple cadence and objective tracker. Not a Gantt. Not a task manager.

Three components:

*Objectives panel:*
- 3-5 current objectives for this level (text entries)
- Source: fed from the level above (read only)
- Owner: set at this level

*Milestones panel:*
- Key dates / deliverables
- Fields: title, due date, owner, status (on track / at risk / complete)
- Maximum 10 milestones — enforce this limit. More than 10 is scope creep.

*Rhythm panel:*
- Standing meeting cadence (weekly / bi-weekly / monthly)
- Upcoming events from the Event Planner (auto-populated)
- Last ORRA-Lite date + next scheduled

Design principle: if it doesn't fit on one screen without scrolling, it's too much. The rhythm board should be readable in 30 seconds.

---

## PHASE 4 — SSG HEALTH PUSH

**File: `src/core/push.js`**

```javascript
/**
 * Meridian SSG Health Push
 * 
 * Reads org_health_signals where pushed_to_ssg = false
 * Applies anonymization
 * POSTs to SSG_PUSH_ENDPOINT
 * Marks records as pushed
 * 
 * Only runs if:
 *   1. ENV.SSG_PUSH.ENABLED = true
 *   2. ENV.SSG_PUSH.ENDPOINT is set
 *   3. Organization has health_push_enabled = true in config
 *   4. Organization has >= MIN_ORG_SIZE_FOR_PUSH active users
 * 
 * See DATA_GOVERNANCE.md for what is and is not transmitted.
 */

import storage from './storage.js';
import ENV from '../config/env.js';

export async function pushHealthSignals(organizationId) {
  if (!ENV.SSG_PUSH.ENABLED || !ENV.SSG_PUSH.ENDPOINT) return { skipped: true, reason: 'Push not configured' };

  const org = await storage.getById('organizations', organizationId);
  if (!org?.config?.health_push_enabled) return { skipped: true, reason: 'Push disabled for this org' };

  const users = await storage.getAll('users', { organization_id: organizationId, active: true });
  if (users.length < ENV.SSG_PUSH.MIN_ORG_SIZE_FOR_PUSH) {
    return { skipped: true, reason: `Org size ${users.length} below minimum ${ENV.SSG_PUSH.MIN_ORG_SIZE_FOR_PUSH}` };
  }

  const unpushed = (await storage.getAll('org_health_signals', { organization_id: organizationId }))
    .filter(s => !s.pushed_to_ssg);

  if (unpushed.length === 0) return { pushed: 0, reason: 'No new signals' };

  // Anonymize before sending — strip all identifiers
  const anonymized = unpushed.map(signal => ({
    signal_date: signal.signal_date,
    lhi_score: signal.lhi_score,
    friction_density: signal.friction_density,
    legitimacy_index: signal.legitimacy_index,
    plh_distribution: signal.plh_distribution,
    readiness_output: signal.readiness_output,
    org_type: signal.org_type,
    org_size_band: signal.org_size_band,
    region_code: signal.region_code
    // organization_id deliberately excluded
  }));

  try {
    const response = await fetch(ENV.SSG_PUSH.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signals: anonymized, schema_version: '1.0' })
    });

    if (response.ok) {
      // Mark as pushed
      for (const signal of unpushed) {
        await storage.update('org_health_signals', signal.id, {
          pushed_to_ssg: true,
          pushed_at: new Date().toISOString()
        });
      }
      return { pushed: unpushed.length };
    }
    return { error: `Push failed: ${response.status}` };
  } catch (err) {
    return { error: err.message };
  }
}
```

---

## PHASE 4 — REST API SERVER

**File: `src/core/api.js`**

The API server is only used in server mode. In local mode the React app reads storage directly. In server mode, the React app calls these endpoints.

Build a complete Express REST API with these routes:

```
GET    /api/health                    — server health check
POST   /api/auth/session              — create session (local: role param; server: credentials)
GET    /api/events                    — list events for org
POST   /api/events                    — create event
GET    /api/events/:id                — get event
PUT    /api/events/:id                — update event
DELETE /api/events/:id                — delete event
GET    /api/events/:id/export/pdf     — export budget PDF
GET    /api/friction-log              — get friction entries for org
POST   /api/friction-log              — create friction entry
PUT    /api/friction-log/:id/resolve  — mark resolved
GET    /api/health-signals            — get health signals for org
POST   /api/health-signals            — save new health signal
POST   /api/health-signals/push       — trigger SSG push for org
GET    /api/rhythm-board              — get rhythm board for org+level
PUT    /api/rhythm-board              — update rhythm board
GET    /api/organizations/:id         — get org config
```

All routes require a valid session (role in local mode, JWT in server mode). Use middleware:
```javascript
async function requireSession(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-role'];
    req.session = await createSession(token, req.headers['x-org-id']);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

---

## PHASE 5 — UI FOUNDATION

### Brand Tokens — `src/ui/styles/tokens.css`

```css
:root {
  /* SSG Brand Colors */
  --ssg-navy-primary:   #1B2A4A;
  --ssg-navy-dark:      #0B1628;
  --ssg-gold:           #C9A84C;
  --ssg-gold-light:     #E8C97A;

  /* Meridian UI — maps to SSG brand */
  --meridian-primary:   var(--ssg-navy-primary);
  --meridian-accent:    var(--ssg-gold);
  --meridian-accent-lt: var(--ssg-gold-light);

  /* Status colors */
  --status-grounded:    #1D9E75;   /* green — healthy */
  --status-rebuilding:  #BA7517;   /* amber — caution */
  --status-scattered:   #A32D2D;   /* red — critical */

  /* Fonts */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-label:   'DM Mono', 'Courier New', monospace;
}
```

### App Shell — `src/ui/App.jsx`

```jsx
// Top-level router
// Routes:
//   /                → DashboardRouter (role selection or JWT-gated dashboard)
//   /events          → EventPlanner list view
//   /events/new      → EventPlanner create
//   /events/:id      → EventPlanner edit
//   /friction-log    → FrictionLog
//   /orra-lite       → OrraLite
//   /plh             → PlhAssessment
//   /rhythm          → RhythmBoard
//   /health          → OrgHealthDashboard

// Navigation: simple sidebar with role-appropriate links
// Links that the current role cannot access are hidden, not just disabled
// SSG logo + "Meridian" wordmark in the header
// Current role/org displayed in header
```

---

## PHASE 5 — EO PILOT SEED DATA

**File: `data/seeds/eo-pilot.seed.js`**

Create realistic seed data for EO pilot testing:

```javascript
// Creates:
// 1 global organization (EO Global)
// 4 regional organizations (Asia Pacific, North America, Europe, Latin America)
// 2 chapter organizations under Asia Pacific (EO Japan, EO Singapore)
// 1 user per role (9 users total, mixed across orgs)
// 2 draft events (1 global/GLC-type, 1 regional)
// 5 friction log entries (varying categories and severities)
// 1 ORRA-Lite result per organization
// EO pilot client config
```

**File: `client/eo-pilot/config.json`**

```json
{
  "client_id": "eo-pilot-001",
  "client_name": "Entrepreneurs' Organization",
  "pilot_status": true,
  "deployment_date": "2026-04-01",
  "organization_type": "global_member_org",
  "dual_track": true,
  "languages_required": ["en", "es", "pt", "ja", "zh"],
  "regions": ["Asia Pacific", "North America", "Europe", "Latin America", "Middle East & Africa"],
  "chapter_count_approx": 220,
  "member_count_approx": 20000,
  "notes": "Pilot Client 01. Reference implementation. All future client configurations measured against this."
}
```

---

## PHASE 5 — SERVER DEPLOYMENT

### Deployment Checklist

**Step 1 — Provision PostgreSQL**
Any standard provider works: Supabase (existing SSG instance), Railway, Render, DigitalOcean, AWS RDS, or self-hosted.

```bash
# If using Supabase (already in SSG stack):
# Connection string: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Step 2 — Run migration**
```bash
# Generate SQL from local JSON data
node scripts/migrate.js \
  --source ./data/local \
  --target postgresql://[connection-string] \
  --output ./data/migrations/output

# Apply to database
psql $DATABASE_URL -f data/migrations/output/001_schema.sql
psql $DATABASE_URL -f data/migrations/output/002_data.sql
```

**Step 3 — Set environment**
```bash
# In .env or hosting provider environment variables:
TARGET=server
DATABASE_URL=postgresql://[connection-string]
JWT_SECRET=[generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
NODE_ENV=production
```

**Step 4 — Single-line flip in env.js**
```javascript
TARGET: "server",  // was "local"
```

**Step 5 — Build and deploy**
```bash
npm run build    # builds React app to /dist
npm run server   # starts Express API
# Serve /dist as static files from the same Express server or a CDN
```

**Step 6 — Verify**
```bash
curl https://[your-domain]/api/health
# Expected: { "status": "ok", "version": "0.1.0", "target": "server" }
```

### Row-Level Security (PostgreSQL)

Add RLS so organizations cannot read each other's data:

```sql
-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE friction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_health_signals ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see records from their organization
-- (app sets app.current_org_id at session start)
CREATE POLICY org_isolation ON events
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- Replicate for each table
```

---

## TESTING REQUIREMENTS

Write tests for:

```
tests/currency.test.js
  - toCents correctly converts dollar strings to integer cents
  - fromCents correctly converts cents to display currency
  - sumCents handles zero values and empty arrays
  - JPY rounds to 0 decimal places
  - Exchange rate conversions are accurate

tests/calculations.test.js
  - calculateEventBudget returns correct grand total
  - Per diem: headcount × days × rate calculates correctly
  - Translation: days × rate calculates correctly per translator
  - syncTranslatorDependencies adds airfare group when travel_required = true
  - Zero values do not cause NaN in totals

tests/storage.test.js
  - create() adds record and returns it with id and created_at
  - getById() returns correct record
  - update() merges changes correctly
  - delete() removes record
  - getAll() with filters returns only matching records
```

Run tests:
```bash
npm test
```

All tests must pass before Phase 5 server deployment.

---

## WHAT NOT TO BUILD

These are deliberate exclusions. Do not add them:

- Gantt charts or timeline views
- Dependency-linked task management
- Automated notifications or email sending (Phase 1-4)
- Mobile app (Phase 1-4)
- Integration with Monday.com, Asana, or any external PM tool
- AI/chat features within the platform
- Social features (comments, reactions, @mentions)
- Time tracking
- Custom field builder
- Reporting builder / drag-and-drop dashboards

If a feature isn't in the backlog or this document, it does not belong in v0.1.0. The operator experience depends on simplicity. Every addition is a friction cost.

---

## FINAL VERIFICATION BEFORE HANDOFF

Before marking any phase complete:

1. All currency values stored as integer USD cents — verify with `typeof value === 'number' && Number.isInteger(value)` for all budget fields
2. No module reads ENV.TARGET directly — all go through ENV.getStorage()
3. No PII in org_health_signals table — verify against DATA_GOVERNANCE.md
4. Role-based visibility enforced — a chapter_staff user cannot see finance panels
5. Volunteer dashboards have no task queues or execution tracking
6. Staff dashboards have full friction log and instrument access
7. Grand total updates in real time on any input change
8. Event save/load round-trips correctly (save → reload → same values)
9. Migration script generates valid SQL — test with: `node scripts/migrate.js --source ./data/local`
10. Server deployment: `TARGET: "server"` in env.js is the only required change

---

*Meridian by SSG — Operators operate. Engineers engineer.*
*The platform does the math. The operator reads the signal.*
