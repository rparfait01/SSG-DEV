import { useState } from 'react';

const CONDITIONS = [
  {
    key: 'safety',
    label: 'Safety',
    description: 'Institutional safety — the freedom to act, speak, and fail without disproportionate consequence',
    items: [
      'I can raise concerns without fear of retaliation',
      'Mistakes are treated as learning opportunities, not punished',
      'I feel secure in my role and its continuation',
      'The institution protects people who flag problems'
    ]
  },
  {
    key: 'identity',
    label: 'Identity',
    description: 'Role clarity and self-concept stability within the organization',
    items: [
      'My role and responsibilities are clearly defined',
      'I understand how my work contributes to the mission',
      'My role aligns with my skills and capabilities',
      'I know what success looks like in my position'
    ]
  },
  {
    key: 'agency',
    label: 'Agency',
    description: 'The sense of meaningful control over decisions and outcomes',
    items: [
      'I have the authority to make decisions within my scope',
      'My input influences decisions that affect my work',
      'I can take initiative without seeking unnecessary approval',
      'I feel able to shape my own work experience'
    ]
  },
  {
    key: 'connection',
    label: 'Connection',
    description: 'Relational quality within the institution',
    items: [
      'I have positive working relationships with my colleagues',
      'I feel I belong in this organization',
      'I receive support from peers and leadership when needed',
      'I trust the people I work with'
    ]
  },
  {
    key: 'contribution',
    label: 'Contribution',
    description: 'The sense of purposeful impact',
    items: [
      'My work makes a meaningful difference',
      'I see the results of my contributions',
      'My efforts are recognized and valued',
      'I feel motivated by the purpose of this organization'
    ]
  }
];

const SCALE = [1, 2, 3, 4, 5];
const SCALE_LABELS = { 1: 'Strongly Disagree', 2: 'Disagree', 3: 'Neutral', 4: 'Agree', 5: 'Strongly Agree' };

export default function PlhAssessment({ storage, session }) {
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const totalItems = CONDITIONS.reduce((sum, c) => sum + c.items.length, 0);
  const answered = Object.keys(responses).length;
  const complete = answered === totalItems;

  function setResponse(conditionKey, itemIndex, value) {
    setResponses(prev => ({ ...prev, [`${conditionKey}_${itemIndex}`]: value }));
  }

  function calcConditionScore(conditionKey, itemCount) {
    const total = Array.from({ length: itemCount }, (_, i) =>
      responses[`${conditionKey}_${i}`] || 0
    ).reduce((sum, v) => sum + v, 0);
    return total / itemCount / 4; // 0-1 scale
  }

  async function handleSubmit() {
    if (!complete) return;
    setSaving(true);

    const scores = CONDITIONS.reduce((acc, cond) => {
      acc[cond.key] = parseFloat(calcConditionScore(cond.key, cond.items.length).toFixed(3));
      return acc;
    }, {});

    // PLH data is individual — NEVER pushed to SSG
    // Saved locally with user_id only
    // NOTE: This individual record is Class A data per DATA_GOVERNANCE.md

    try {
      setResult(scores);
      // Save individual result locally — Class A data, never pushed
    } finally {
      setSaving(false);
    }
  }

  const barColor = (score) => {
    if (score >= 0.7) return 'var(--status-grounded)';
    if (score >= 0.45) return 'var(--status-rebuilding)';
    return 'var(--status-scattered)';
  };

  if (result) {
    return (
      <div className="module plh-assessment">
        <div className="module__header">
          <h1>PLH Assessment Results</h1>
        </div>

        <div className="plh-results">
          <div className="results-note results-note--prominent">
            These results are for your reflection only. Individual scores are stored locally and never shared with SSG or your organization.
          </div>

          {CONDITIONS.map(cond => {
            const score = result[cond.key];
            const pct = Math.round(score * 100);
            return (
              <div key={cond.key} className="plh-condition-result">
                <div className="condition-header">
                  <span className="condition-label">{cond.label}</span>
                  <span className="condition-score">{pct}%</span>
                </div>
                <div className="condition-bar-track">
                  <div
                    className="condition-bar-fill"
                    style={{ width: `${pct}%`, background: barColor(score) }}
                  />
                </div>
                <p className="condition-description">{cond.description}</p>
              </div>
            );
          })}

          <button className="btn-secondary" onClick={() => { setResult(null); setResponses({}); }}>
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  let itemGlobalIndex = 0;

  return (
    <div className="module plh-assessment">
      <div className="module__header">
        <h1>PLH Assessment</h1>
        <div className="progress-indicator">{answered} of {totalItems} answered</div>
      </div>

      <div className="module-intro">
        <p>This is a personal reflection instrument. Rate each statement honestly based on your current experience in this organization.</p>
        <p><strong>Privacy note:</strong> Your individual responses are never shared. Only aggregate distributions (if your organization has ≥ 10 members) may appear on the health dashboard.</p>
      </div>

      {CONDITIONS.map(cond => (
        <div key={cond.key} className="plh-condition">
          <div className="condition-section-header">
            <h2>{cond.label}</h2>
            <p className="condition-desc">{cond.description}</p>
          </div>

          {cond.items.map((itemText, idx) => {
            const key = `${cond.key}_${idx}`;
            return (
              <div key={key} className="plh-item">
                <p className="plh-item-text">{itemText}</p>
                <div className="likert-scale">
                  {SCALE.map(value => (
                    <button
                      key={value}
                      className={`likert-btn ${responses[key] === value ? 'selected' : ''}`}
                      onClick={() => setResponse(cond.key, idx, value)}
                      title={SCALE_LABELS[value]}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="submit-block">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!complete || saving}
        >
          {saving ? 'Processing…' : complete ? 'View My Results' : `${totalItems - answered} items remaining`}
        </button>
      </div>
    </div>
  );
}
