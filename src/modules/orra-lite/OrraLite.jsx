import { useState } from 'react';

const ITEMS = [
  // Farmer layer (leadership) — items 0-3
  { id: 1, layer: 'farmer', text: 'Leadership decisions are consistent with stated values' },
  { id: 2, layer: 'farmer', text: 'Accountability is applied equally regardless of seniority' },
  { id: 3, layer: 'farmer', text: 'Leaders recognize and develop capability below their level' },
  { id: 4, layer: 'farmer', text: 'Communication from leadership is clear and timely' },
  // Soil layer (environment) — items 4-7
  { id: 5, layer: 'soil',   text: 'Processes support the work rather than obstruct it' },
  { id: 6, layer: 'soil',   text: 'Role clarity is sufficient — people know what they own' },
  { id: 7, layer: 'soil',   text: 'Resources are available when needed' },
  { id: 8, layer: 'soil',   text: 'Information flows to where decisions are made' },
  // Seed layer (individual) — items 8-11
  { id: 9,  layer: 'seed',  text: 'People have the skills needed for their current responsibilities' },
  { id: 10, layer: 'seed',  text: 'New members integrate into the team effectively' },
  { id: 11, layer: 'seed',  text: 'Performance expectations are understood' },
  { id: 12, layer: 'seed',  text: 'Individual contributions are recognized' }
];

const SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' }
];

const LAYER_LABELS = {
  farmer: 'Farmer Layer — Leadership',
  soil:   'Soil Layer — Environment',
  seed:   'Seed Layer — Individual'
};

const LAYER_WEIGHTS = { farmer: 0.5, soil: 0.35, seed: 0.15 };

function readinessOutput(lhi) {
  if (lhi >= 70) return 'Grounded';
  if (lhi >= 45) return 'Rebuilding';
  return 'Scattered';
}

function readinessColor(output) {
  return {
    Grounded:   'var(--status-grounded)',
    Rebuilding: 'var(--status-rebuilding)',
    Scattered:  'var(--status-scattered)'
  }[output];
}

export default function OrraLite({ storage, session }) {
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const answered = Object.keys(responses).length;
  const complete = answered === ITEMS.length;

  function setResponse(id, value) {
    setResponses(prev => ({ ...prev, [id]: value }));
  }

  function calcLayerScore(layer) {
    const layerItems = ITEMS.filter(i => i.layer === layer);
    const total = layerItems.reduce((sum, item) => sum + (responses[item.id] || 0), 0);
    const avg = total / layerItems.length;
    return Math.round(avg * 25);
  }

  async function handleSubmit() {
    if (!complete) return;
    setSaving(true);

    const farmerScore = calcLayerScore('farmer');
    const soilScore   = calcLayerScore('soil');
    const seedScore   = calcLayerScore('seed');
    const lhiScore    = Math.round(
      farmerScore * LAYER_WEIGHTS.farmer +
      soilScore   * LAYER_WEIGHTS.soil +
      seedScore   * LAYER_WEIGHTS.seed
    );

    const output = readinessOutput(lhiScore);

    const signal = {
      organization_id: session.organization_id,
      signal_date: new Date().toISOString().slice(0, 10),
      instrument: 'orra-lite',
      lhi_score: lhiScore,
      farmer_score: farmerScore,
      soil_score: soilScore,
      seed_score: seedScore,
      readiness_output: output,
      respondent_count: 1,
      org_type: 'chapter',
      org_size_band: 'small',
      pushed_to_ssg: false
    };

    try {
      if (storage) await storage.create('org_health_signals', signal);
      setResult({ farmerScore, soilScore, seedScore, lhiScore, output });
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    return (
      <div className="module orra-lite">
        <div className="module__header">
          <h1>ORRA-Lite Results</h1>
        </div>

        <div className="orra-results">
          <div className="lhi-display" style={{ color: readinessColor(result.output) }}>
            <div className="lhi-score">{result.lhiScore}</div>
            <div className="lhi-label">LHI Score</div>
            <div className="readiness-badge" style={{ background: readinessColor(result.output) }}>
              {result.output}
            </div>
          </div>

          <div className="layer-scores">
            {[
              { key: 'farmer', label: 'Farmer (Leadership)', score: result.farmerScore, weight: '50%' },
              { key: 'soil',   label: 'Soil (Environment)',  score: result.soilScore,   weight: '35%' },
              { key: 'seed',   label: 'Seed (Individual)',   score: result.seedScore,   weight: '15%' }
            ].map(({ key, label, score, weight }) => (
              <div key={key} className="layer-score-row">
                <span className="layer-label">{label}</span>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${score}%`, background: 'var(--ssg-navy-primary)' }} />
                </div>
                <span className="score-value">{score}</span>
                <span className="score-weight">{weight}</span>
              </div>
            ))}
          </div>

          <div className="results-note">
            Individual responses are not stored. Only aggregate scores are saved.
          </div>

          <button className="btn-primary" onClick={() => { setResult(null); setResponses({}); }}>
            Run Again
          </button>
        </div>
      </div>
    );
  }

  const layers = ['farmer', 'soil', 'seed'];

  return (
    <div className="module orra-lite">
      <div className="module__header">
        <h1>ORRA-Lite</h1>
        <div className="progress-indicator">{answered} of {ITEMS.length} answered</div>
      </div>

      <p className="module-intro">
        Rate each statement on a 1–5 scale based on your direct experience. Be candid — the purpose is diagnostic, not evaluative.
      </p>

      {layers.map(layer => (
        <div key={layer} className="orra-layer">
          <h2 className="layer-heading">{LAYER_LABELS[layer]}</h2>
          {ITEMS.filter(i => i.layer === layer).map(item => (
            <div key={item.id} className="orra-item">
              <p className="orra-item-text">{item.text}</p>
              <div className="likert-scale">
                {SCALE.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`likert-btn ${responses[item.id] === value ? 'selected' : ''}`}
                    onClick={() => setResponse(item.id, value)}
                    title={label}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {responses[item.id] && (
                <span className="likert-selected-label">
                  {SCALE.find(s => s.value === responses[item.id])?.label}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="submit-block">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!complete || saving}
        >
          {saving ? 'Saving…' : complete ? 'Submit & Calculate' : `${ITEMS.length - answered} more to complete`}
        </button>
      </div>
    </div>
  );
}
