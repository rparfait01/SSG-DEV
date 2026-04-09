/**
 * Meridian REST API Server
 *
 * Used in server mode only. In local mode, React reads storage directly.
 * In server mode, React calls these endpoints.
 *
 * Start: node src/core/api.js
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createSession, can } from './auth.js';
import storage from './storage.js';
import { pushHealthSignals } from './push.js';
import { calculateEventBudget } from '../utils/calculations.js';
import { validateEvent, validateFrictionEntry } from '../utils/validators.js';
import ENV from '../config/env.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Auth Middleware ───────────────────────────────────────────────────────────

async function requireSession(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-role'];
    const orgId = req.headers['x-org-id'];
    req.session = await createSession(token, orgId);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ─── Health Check ──────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: ENV.APP_VERSION, target: ENV.TARGET });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/session', async (req, res) => {
  try {
    const { role, token, organization_id } = req.body;
    const session = await createSession(role || token, organization_id);
    res.json({ session });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ─── Events ───────────────────────────────────────────────────────────────────

app.get('/api/events', requireSession, async (req, res) => {
  try {
    const events = await storage.getAll('events', { organization_id: req.session.organization_id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', requireSession, async (req, res) => {
  if (!can(req.session.role, 'create_event')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const { valid, errors } = validateEvent(req.body);
  if (!valid) return res.status(400).json({ error: 'Validation failed', details: errors });

  try {
    const withCalc = calculateEventBudget(req.body);
    const event = await storage.create('events', {
      ...withCalc,
      organization_id: req.session.organization_id,
      created_by: req.session.id,
      status: 'draft'
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', requireSession, async (req, res) => {
  try {
    const event = await storage.getById('events', req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    if (event.organization_id !== req.session.organization_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', requireSession, async (req, res) => {
  try {
    const existing = await storage.getById('events', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.organization_id !== req.session.organization_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { valid, errors } = validateEvent({ ...existing, ...req.body });
    if (!valid) return res.status(400).json({ error: 'Validation failed', details: errors });

    const withCalc = calculateEventBudget({ ...existing, ...req.body });
    const updated = await storage.update('events', req.params.id, withCalc);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', requireSession, async (req, res) => {
  try {
    const existing = await storage.getById('events', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.organization_id !== req.session.organization_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await storage.delete('events', req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id/export/pdf', requireSession, async (req, res) => {
  // PDF export is handled client-side via jsPDF
  // This endpoint returns the event data for server-side rendering if needed
  try {
    const event = await storage.getById('events', req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Friction Log ──────────────────────────────────────────────────────────────

app.get('/api/friction-log', requireSession, async (req, res) => {
  try {
    const entries = await storage.getAll('friction_log', { organization_id: req.session.organization_id });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friction-log', requireSession, async (req, res) => {
  if (!can(req.session.role, 'log_friction')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const { valid, errors } = validateFrictionEntry(req.body);
  if (!valid) return res.status(400).json({ error: 'Validation failed', details: errors });

  try {
    const entry = await storage.create('friction_log', {
      ...req.body,
      organization_id: req.session.organization_id,
      logged_by: req.session.id,
      resolved: false
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/friction-log/:id/resolve', requireSession, async (req, res) => {
  try {
    const updated = await storage.update('friction_log', req.params.id, {
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolution_notes: req.body.resolution_notes || ''
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Signals ────────────────────────────────────────────────────────────

app.get('/api/health-signals', requireSession, async (req, res) => {
  try {
    const signals = await storage.getAll('org_health_signals', { organization_id: req.session.organization_id });
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/health-signals', requireSession, async (req, res) => {
  try {
    const signal = await storage.create('org_health_signals', {
      ...req.body,
      organization_id: req.session.organization_id,
      pushed_to_ssg: false
    });
    res.status(201).json(signal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/health-signals/push', requireSession, async (req, res) => {
  try {
    const result = await pushHealthSignals(req.session.organization_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Rhythm Board ─────────────────────────────────────────────────────────────

app.get('/api/rhythm-board', requireSession, async (req, res) => {
  try {
    const boards = await storage.getAll('rhythm_board', { organization_id: req.session.organization_id });
    res.json(boards[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rhythm-board', requireSession, async (req, res) => {
  try {
    const existing = await storage.getAll('rhythm_board', { organization_id: req.session.organization_id });
    let result;
    if (existing.length > 0) {
      result = await storage.update('rhythm_board', existing[0].id, req.body);
    } else {
      result = await storage.create('rhythm_board', {
        ...req.body,
        organization_id: req.session.organization_id
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Organizations ─────────────────────────────────────────────────────────────

app.get('/api/organizations/:id', requireSession, async (req, res) => {
  try {
    const org = await storage.getById('organizations', req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────────

const PORT = ENV.SERVER.PORT;
app.listen(PORT, () => {
  console.log(`Meridian API — ${ENV.APP_VERSION} — port ${PORT} — mode: ${ENV.TARGET}`);
});

export default app;
