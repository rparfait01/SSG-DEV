import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STATUS_OPTIONS = ['on_track', 'at_risk', 'complete'];
const STATUS_LABELS = { on_track: 'On Track', at_risk: 'At Risk', complete: 'Complete' };
const STATUS_COLOR = {
  on_track: 'var(--status-grounded)',
  at_risk:  'var(--status-rebuilding)',
  complete: 'var(--ssg-navy-primary)'
};
const MAX_MILESTONES = 10;
const MAX_OBJECTIVES = 5;

export default function RhythmBoard({ storage, session }) {
  const [board, setBoard] = useState({
    objectives: [],
    milestones: [],
    rhythm: { meeting_cadence: 'monthly', last_orra_lite_date: '', next_orra_lite_date: '' }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!storage) return;
    storage.getAll('rhythm_board', {
      organization_id: session.organization_id
    }).then(records => {
      if (records.length > 0) setBoard(records[0]);
    }).catch(console.error);
  }, [storage, session.organization_id]);

  async function save(updated) {
    setBoard(updated);
    if (!storage) return;
    setSaving(true);
    try {
      if (updated.id) {
        await storage.update('rhythm_board', updated.id, updated);
      } else {
        const saved = await storage.create('rhythm_board', {
          ...updated,
          organization_id: session.organization_id,
          level: session.role
        });
        setBoard(saved);
      }
    } finally {
      setSaving(false);
    }
  }

  // Objectives
  function addObjective() {
    if (board.objectives.length >= MAX_OBJECTIVES) return;
    save({ ...board, objectives: [...board.objectives, { id: uuidv4(), text: '', owner: '', source_level: '' }] });
  }

  function updateObjective(id, field, value) {
    save({ ...board, objectives: board.objectives.map(o => o.id === id ? { ...o, [field]: value } : o) });
  }

  function removeObjective(id) {
    save({ ...board, objectives: board.objectives.filter(o => o.id !== id) });
  }

  // Milestones
  function addMilestone() {
    if (board.milestones.length >= MAX_MILESTONES) return;
    save({
      ...board,
      milestones: [...board.milestones, {
        id: uuidv4(), title: '', due_date: '', owner: '', status: 'on_track'
      }]
    });
  }

  function updateMilestone(id, field, value) {
    save({ ...board, milestones: board.milestones.map(m => m.id === id ? { ...m, [field]: value } : m) });
  }

  function removeMilestone(id) {
    save({ ...board, milestones: board.milestones.filter(m => m.id !== id) });
  }

  // Rhythm
  function updateRhythm(field, value) {
    save({ ...board, rhythm: { ...board.rhythm, [field]: value } });
  }

  return (
    <div className="module rhythm-board">
      <div className="module__header">
        <h1>Rhythm Board</h1>
        {saving && <span className="saving-indicator">Saving…</span>}
      </div>

      <p className="module-intro">
        If it doesn't fit on one screen, it's too much. Objectives: max {MAX_OBJECTIVES}. Milestones: max {MAX_MILESTONES}.
      </p>

      {/* Objectives Panel */}
      <div className="rhythm-panel">
        <div className="panel-header">
          <h2>Objectives</h2>
          <span className="panel-count">{board.objectives.length}/{MAX_OBJECTIVES}</span>
          {board.objectives.length < MAX_OBJECTIVES && (
            <button className="btn-add" onClick={addObjective}>+ Add</button>
          )}
        </div>
        {board.objectives.length === 0 && (
          <p className="empty-state">No current objectives. Add up to {MAX_OBJECTIVES}.</p>
        )}
        {board.objectives.map(obj => (
          <div key={obj.id} className="objective-row">
            <input
              type="text"
              value={obj.text}
              onChange={e => updateObjective(obj.id, 'text', e.target.value)}
              placeholder="Objective statement"
              className="objective-text"
            />
            <input
              type="text"
              value={obj.owner}
              onChange={e => updateObjective(obj.id, 'owner', e.target.value)}
              placeholder="Owner"
              className="objective-owner"
            />
            <button className="btn-remove" onClick={() => removeObjective(obj.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Milestones Panel */}
      <div className="rhythm-panel">
        <div className="panel-header">
          <h2>Milestones</h2>
          <span className="panel-count">{board.milestones.length}/{MAX_MILESTONES}</span>
          {board.milestones.length < MAX_MILESTONES && (
            <button className="btn-add" onClick={addMilestone}>+ Add</button>
          )}
        </div>
        {board.milestones.length === 0 && (
          <p className="empty-state">No milestones. Add up to {MAX_MILESTONES}.</p>
        )}
        {board.milestones.map(ms => (
          <div key={ms.id} className="milestone-row">
            <input
              type="text"
              value={ms.title}
              onChange={e => updateMilestone(ms.id, 'title', e.target.value)}
              placeholder="Milestone title"
              className="milestone-title"
            />
            <input
              type="date"
              value={ms.due_date}
              onChange={e => updateMilestone(ms.id, 'due_date', e.target.value)}
              className="milestone-date"
            />
            <input
              type="text"
              value={ms.owner}
              onChange={e => updateMilestone(ms.id, 'owner', e.target.value)}
              placeholder="Owner"
              className="milestone-owner"
            />
            <select
              value={ms.status}
              onChange={e => updateMilestone(ms.id, 'status', e.target.value)}
              className="milestone-status"
              style={{ color: STATUS_COLOR[ms.status] }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button className="btn-remove" onClick={() => removeMilestone(ms.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Rhythm Panel */}
      <div className="rhythm-panel">
        <h2>Cadence</h2>
        <div className="field-row">
          <label>Meeting Cadence</label>
          <div className="toggle-group">
            {['weekly', 'bi-weekly', 'monthly'].map(c => (
              <button
                key={c}
                className={`toggle-btn ${board.rhythm.meeting_cadence === c ? 'active' : ''}`}
                onClick={() => updateRhythm('meeting_cadence', c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="field-row field-row--split">
          <div>
            <label>Last ORRA-Lite</label>
            <input
              type="date"
              value={board.rhythm.last_orra_lite_date}
              onChange={e => updateRhythm('last_orra_lite_date', e.target.value)}
            />
          </div>
          <div>
            <label>Next ORRA-Lite</label>
            <input
              type="date"
              value={board.rhythm.next_orra_lite_date}
              onChange={e => updateRhythm('next_orra_lite_date', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
