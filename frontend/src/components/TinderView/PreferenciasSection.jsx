import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

const DISTANCE = { min: 10, max: 1000 };
// Prisma requires a positive Int. This exceeds every terrestrial distance;
// keep the transport value out of labels and numeric controls.
const UNLIMITED_DISTANCE = 100000;
const DISTANCE_OPTIONS = [10, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500, UNLIMITED_DISTANCE];
const distanceIndex = (value) => {
  if (value === UNLIMITED_DISTANCE) return DISTANCE_OPTIONS.length - 1;
  return DISTANCE_OPTIONS.slice(0, -1).reduce((nearest, option, index) =>
    Math.abs(option - value) < Math.abs(DISTANCE_OPTIONS[nearest] - value) ? index : nearest, 0);
};
const AGE = { min: 18, max: 100 };
const MIN_AGE_GAP = 5;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Math.round(value)));
const percent = (value, { min, max }) => ((value - min) / (max - min)) * 100;
const normalize = (data) => {
  const edadMinima = clamp(data?.edadMinima ?? 18, AGE.min, AGE.max - MIN_AGE_GAP);
  return {
    distanciaMaxKm: data?.distanciaMaxKm === UNLIMITED_DISTANCE
      ? UNLIMITED_DISTANCE
      : clamp(data?.distanciaMaxKm ?? 50, DISTANCE.min, DISTANCE.max),
    edadMinima,
    edadMaxima: clamp(data?.edadMaxima ?? 100, edadMinima + MIN_AGE_GAP, AGE.max),
  };
};

// Keep a draft while typing so replacing 30 with 100 doesn't clamp the first "1".
// Valid drafts update the slider immediately; blur/Enter commits a clamped value.
function NumberControl({ id, label, value, min, max, onChange, unit }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const next = draft.trim() === '' ? value : clamp(Number(draft), min, max);
    const safe = Number.isFinite(next) ? next : value;
    setDraft(String(safe));
    onChange(safe);
  };
  return (
    <div className="preferences-number">
      <input id={id} type="number" aria-label={label} min={min} max={max} step="1" value={draft}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          const number = Number(raw);
          if (raw !== '' && Number.isInteger(number) && number >= min && number <= max) onChange(number);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') { event.preventDefault(); commit(); }
        }} />
      <span className="preferences-steppers">
        <button type="button" aria-label={`Aumentar ${label.toLowerCase()}`} disabled={value >= max}
          onClick={() => { const next = clamp(value + 1, min, max); setDraft(String(next)); onChange(next); }}>
          <svg viewBox="0 0 16 10" aria-hidden="true"><path d="m3 7 5-5 5 5" /></svg>
        </button>
        <button type="button" aria-label={`Disminuir ${label.toLowerCase()}`} disabled={value <= min}
          onClick={() => { const next = clamp(value - 1, min, max); setDraft(String(next)); onChange(next); }}>
          <svg viewBox="0 0 16 10" aria-hidden="true"><path d="m3 3 5 5 5-5" /></svg>
        </button>
      </span>
      {unit && <span className="preferences-unit" aria-hidden="true">{unit}</span>}
    </div>
  );
}

function RangeTrack({ start = 0, end, children, min, max, ticks = [], badges = [] }) {
  return (
    <div className="preferences-range">
      <div className="preferences-range-inputs" style={{ '--range-start': `${start}%`, '--range-end': `${end}%` }}>
        <div className="preferences-track" aria-hidden="true" />
        <div className="preferences-range-overlay" aria-hidden="true">
          {badges.map(({ position, text, centered }, index) => (
            <span key={index} className="preferences-value-badge"
              style={{ left: `${position}%`, transform: centered ? 'translateX(-50%)' : `translateX(-${position}%)` }}>{text}</span>
          ))}
        </div>
        {children}
      </div>
      <div className="preferences-scale" aria-hidden="true">
        {ticks.map(({ position, label }) => (
          <span key={position} className="preferences-tick" style={{ left: `${position}%` }}>
            {label && <span className="preferences-tick-label">{label}</span>}
          </span>
        ))}
      </div>
      <div className="preferences-endpoints" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}

function DistanceRangeControl({ value, onChange }) {
  const index = distanceIndex(value);
  const unlimited = value === UNLIMITED_DISTANCE;
  const position = index / (DISTANCE_OPTIONS.length - 1) * 100;
  return (
    <div className="preferences-control">
      <label className="preferences-label" htmlFor="preferencia-distancia">Distancia máxima (km)</label>
      <div className="preferences-distance-row">
        <RangeTrack end={position} min="10" max="Sin límite"
          badges={[{ position, text: unlimited ? 'Sin límite' : `${value} km`, centered: true }]}
          ticks={DISTANCE_OPTIONS.map((option, i) => ({
            position: i / (DISTANCE_OPTIONS.length - 1) * 100,
            label: [50, 100].includes(option) ? option : null,
          }))}>
          <input type="range" aria-label="Distancia máxima en kilómetros"
            min="0" max={DISTANCE_OPTIONS.length - 1} step="1" value={index}
            aria-valuetext={unlimited ? 'Sin límite' : `${value} km`}
            onChange={(event) => onChange(DISTANCE_OPTIONS[Number(event.target.value)])} />
        </RangeTrack>
        {unlimited ? (
          <div className="preferences-number">
            <input id="preferencia-distancia" type="text" aria-label="Distancia máxima: Sin límite"
              value="Sin límite" disabled />
          </div>
        ) : (
          <NumberControl id="preferencia-distancia" label="Distancia máxima" value={value} {...DISTANCE} onChange={onChange} unit="km" />
        )}
      </div>
    </div>
  );
}

function AgeRangeControl({ min, max, onMinChange, onMaxChange }) {
  const start = percent(min, AGE);
  const end = percent(max, AGE);
  // Split the overlapping native controls midway between their centers.
  const midpoint = (start + end) / 2;
  const split = `calc(${midpoint}% + ${14 - 28 * midpoint / 100}px)`;
  return (
    <div className="preferences-control">
      <h4 className="preferences-label" id="preferencias-edad">Rango de edad</h4>
      <RangeTrack start={start} end={end} {...AGE}
        badges={[{ position: start, text: min, centered: true }, { position: end, text: max, centered: true }]}
        ticks={[18, 30, 50, 70, 100].map((age) => ({
          position: percent(age, AGE), label: age !== 18 && age !== 100 ? age : null,
        }))}>
        <input type="range" aria-label="Edad mínima" {...AGE} step="1" value={min}
          aria-valuemax={max - MIN_AGE_GAP} style={{ clipPath: `inset(0 calc(100% - ${split}) 0 0)` }}
          onChange={(event) => onMinChange(clamp(Number(event.target.value), AGE.min, max - MIN_AGE_GAP))} />
        <input type="range" aria-label="Edad máxima" {...AGE} step="1" value={max}
          aria-valuemin={min + MIN_AGE_GAP} style={{ clipPath: `inset(0 0 0 ${split})` }}
          onChange={(event) => onMaxChange(clamp(Number(event.target.value), min + MIN_AGE_GAP, AGE.max))} />
      </RangeTrack>
      <div className="preferences-age-inputs">
        <div>
          <label className="preferences-label" htmlFor="preferencia-edad-min">Edad mínima</label>
          <NumberControl id="preferencia-edad-min" label="Edad mínima" value={min} min={AGE.min} max={max - MIN_AGE_GAP} onChange={onMinChange} />
        </div>
        <div>
          <label className="preferences-label" htmlFor="preferencia-edad-max">Edad máxima</label>
          <NumberControl id="preferencia-edad-max" label="Edad máxima" value={max} min={min + MIN_AGE_GAP} max={AGE.max} onChange={onMaxChange} />
        </div>
      </div>
    </div>
  );
}

export default function PreferenciasSection({ usuarioId, onSaved, onShowToast }) {
  const [preferencia, setPreferencia] = useState(null);
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [draftChanges, setDraftChanges] = useState({});
  const [resetVersion, setResetVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.getPreferencia(usuarioId).then((data) => {
      if (cancelled) return;
      // Retain persisted values for exact cancellation, including legacy ranges.
      const next = data ? {
        distanciaMaxKm: data.distanciaMaxKm,
        edadMinima: data.edadMinima,
        edadMaxima: data.edadMaxima,
      } : normalize(null);
      setPreferencia(data);
      setForm(next);
      setBaseline(next);
      setDraftChanges({});
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [usuarioId, retry]);

  const invalidAgeRange = !!form && (
    form.edadMinima < AGE.min || form.edadMaxima > AGE.max ||
    form.edadMaxima - form.edadMinima < MIN_AGE_GAP
  );

  const dirty = !!form && !!baseline && (
    Object.keys(baseline).some((key) => form[key] !== baseline[key]) ||
    Object.values(draftChanges).some(Boolean)
  );

  const cancel = () => {
    setForm({ ...baseline });
    setDraftChanges({});
    // Remount input drafts too, including an empty/invalid draft whose numeric value didn't change.
    setResetVersion((version) => version + 1);
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving || !dirty || invalidAgeRange) return;
    setSaving(true);
    try {
      const saved = await api.guardarPreferencia(usuarioId, normalize(form), preferencia !== null);
      setPreferencia(saved);
      setForm(normalize(saved));
      setBaseline(normalize(saved));
      setDraftChanges({});
      setResetVersion((version) => version + 1);
      onShowToast('Preferencias de búsqueda guardadas', 'success');
      onSaved();
    } catch (err) {
      onShowToast(err.message || 'Error al guardar preferencias', 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  return (
    <section className="preferences-panel" aria-labelledby="preferencias-title" aria-busy={loading || saving}>
      <h3 id="preferencias-title">Preferencias de búsqueda</h3>
      <p className="preferences-subtitle">Elegí la distancia y el rango de edad de los perfiles que querés conocer.</p>
      {loading ? <p role="status">Cargando preferencias…</p> : error ? (
        <div role="alert">
          {error}{' '}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRetry((n) => n + 1)}>Reintentar</button>
        </div>
      ) : (
        <form onSubmit={save} noValidate>
          {!preferencia && <p className="preferences-notice">Todavía no tenés preferencias guardadas. Revisá estos valores iniciales y guardalos para buscar candidatos.</p>}
          <fieldset key={resetVersion} className="preferences-fields" disabled={saving}
            onChangeCapture={(event) => {
              const fields = { 'preferencia-distancia': 'distanciaMaxKm', 'preferencia-edad-min': 'edadMinima', 'preferencia-edad-max': 'edadMaxima' };
              const field = fields[event.target.id];
              if (field) setDraftChanges((previous) => ({ ...previous, [field]: event.target.value !== String(baseline[field]) }));
            }}
            onBlur={() => setDraftChanges({})}>
            <legend className="preferences-sr-only">Configurar preferencias de búsqueda</legend>
            <DistanceRangeControl value={form.distanciaMaxKm} onChange={(value) => update('distanciaMaxKm', value)} />
            {invalidAgeRange ? (
              <div className="preferences-notice" role="status">
                El rango guardado ({form.edadMinima}–{form.edadMaxima}) no cumple los límites de 18–100 años
                y la diferencia mínima de {MIN_AGE_GAP} años. Se conserva sin cambios hasta que lo ajustes y guardes.{' '}
                <button type="button" className="btn btn-secondary btn-sm"
                  onClick={() => setForm((previous) => ({ ...previous,
                    edadMinima: normalize(previous).edadMinima,
                    edadMaxima: normalize(previous).edadMaxima,
                  }))}>Ajustar rango de edad</button>
              </div>
            ) : <AgeRangeControl min={form.edadMinima} max={form.edadMaxima}
              onMinChange={(value) => update('edadMinima', value)} onMaxChange={(value) => update('edadMaxima', value)} />}
            <div className="preferences-actions">
              <span className="preferences-pending" role="status">{dirty ? 'Cambios sin guardar' : ''}</span>
              {dirty && <button type="button" className="btn btn-secondary preferences-cancel" onClick={cancel}>Cancelar</button>}
              <button type="submit" className="btn preferences-save" disabled={!dirty || saving || invalidAgeRange}>{saving ? 'Guardando…' : 'Guardar preferencias'}</button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
