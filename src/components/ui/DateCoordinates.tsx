'use client';

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { CosmicButton } from './CosmicButton';
import { castReading, isValidDate, type BirthDate } from '@/lib/astro/reading';
import { julianDay, longitudeForDate } from '@/lib/astro/ephemeris';
import { useCosmic } from '@/lib/store';

type DateParts = { day: string; month: string; year: string };
const EMPTY: DateParts = { day: '', month: '', year: '' };

export function DateCoordinates({ onPlotted }: { onPlotted?: () => void }) {
  const setReading = useCosmic((state) => state.setReading);
  const reading = useCosmic((state) => state.reading);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [parts, setParts] = useState<DateParts>(EMPTY);
  const [error, setError] = useState('');
  const date = useMemo<BirthDate>(() => ({ day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) }), [parts]);
  const complete = parts.day.length === 2 && parts.month.length === 2 && parts.year.length === 4;
  const valid = complete && isValidDate(date);
  const telemetry = valid ? longitudeForDate(new Date(Date.UTC(date.year, date.month - 1, date.day, 12))) : null;

  const update = (key: keyof DateParts, value: string) => {
    const index = (['day', 'month', 'year'] as const).indexOf(key);
    const nextValue = value.replace(/\D/g, '').slice(0, key === 'year' ? 4 : 2);
    setParts((current) => ({ ...current, [key]: nextValue }));
    setError('');
    if (nextValue.length === (key === 'year' ? 4 : 2) && index < 2) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !event.currentTarget.value && index > 0) refs.current[index - 1]?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!complete) {
      setError('Enter the day, month and four-digit year of your birth.');
      return;
    }
    if (date.year < 1900) {
      setError('The instrument is calibrated from 1900 onwards.');
      return;
    }
    if (!valid) {
      setError('That date does not exist, or has not happened yet.');
      return;
    }
    setError('');
    setReading(castReading(date));
    onPlotted?.();
  };

  const clear = () => {
    setParts(EMPTY);
    setError('');
    setReading(null);
    refs.current[0]?.focus();
  };

  return <form className="chart-console instrument-panel" onSubmit={submit} noValidate>
    <p className="eyebrow">Navigation · natal coordinates</p>
    <h2 className="display-md">Your date of birth</h2>
    <div className="coord-grid">
      {(['day', 'month', 'year'] as const).map((key, index) => <div className="coord-field" key={key}>
        <label htmlFor={`birth-${key}`}>{key === 'day' ? 'Day · 01 – 31' : key === 'month' ? 'Month · 01 – 12' : 'Year · four digits'}</label>
        <input ref={(node) => { refs.current[index] = node; }} id={`birth-${key}`} className="coord-input" type="text" inputMode="numeric" autoComplete={`bday-${key}`} maxLength={key === 'year' ? 4 : 2} placeholder={key === 'year' ? 'YYYY' : key === 'day' ? 'DD' : 'MM'} value={parts[key]} aria-invalid={Boolean(error)} aria-describedby={error ? 'birth-error' : undefined} onKeyDown={(event) => onKeyDown(event, index)} onChange={(event) => update(key, event.target.value)} />
      </div>)}
    </div>
    {error && <p id="birth-error" className="form-error" role="alert">{error}</p>}
    <div className="telemetry" aria-live="polite"><span>Julian day<strong>{valid ? julianDay(date.year, date.month, date.day, 12).toFixed(1) : '—'}</strong></span><span>Solar longitude<strong>{telemetry ? `${telemetry.sun.toFixed(2)}°` : '—'}</strong></span></div>
    <div className="flex items-center gap-4 mt-8"><CosmicButton type="submit">{reading ? 'Recalculate' : 'Plot my coordinates'}</CosmicButton>{reading && <button type="button" className="nav-link" onClick={clear}>Clear</button>}</div>
    <p className="instrument-note mt-8">Calculated in your browser. Nothing is stored or sent.</p>
  </form>;
}
