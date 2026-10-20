'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { COURSES, courseBySlug } from '@/data/courses';
import { useCosmic } from '@/lib/store';
import { scrollState } from '@/lib/scroll';
import { CosmicButton } from './CosmicButton';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldErrors = Record<string, string>;
const FOCUS_OPTIONS = [
  { value: 'birth-chart', label: 'Birth chart reading' },
  { value: 'numerology', label: 'Numerology reading' },
  { value: 'combined', label: 'Birth chart and numbers together' },
  { value: 'course', label: 'A course' },
];

export function ConsultationDialog() {
  const dialog = useCosmic((state) => state.dialog);
  const close = useCosmic((state) => state.closeDialog);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState('');
  const course = dialog?.kind === 'course' && dialog.courseSlug ? courseBySlug(dialog.courseSlug) : undefined;

  useEffect(() => {
    if (!dialog) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStatus('idle');
    setErrors({});
    setFailure('');
    const panelElement = panel.current;
    const firstControl = panelElement?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea') ?? panelElement?.querySelector<HTMLElement>('button');
    firstControl?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab' || !panelElement) return;
      const focusable = Array.from(panelElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])',
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-locked');
    scrollState.lenis?.stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
      scrollState.lenis?.start();
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [dialog, close]);

  if (!dialog) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending' || !dialog) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const local: FieldErrors = {};
    if (!String(data.name ?? '').trim()) local.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email ?? '').trim())) local.email = 'Please enter a valid email address.';
    if (!FOCUS_OPTIONS.some((option) => option.value === data.focus)) local.focus = 'Please choose what you would like to explore.';
    if (Object.keys(local).length) {
      setErrors(local);
      setFailure('Please check the highlighted fields.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrors({});
    setFailure('');
    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, course: dialog.courseSlug || data.course, source: dialog.source }),
      });
      const result = await response.json() as { ok: boolean; errors?: FieldErrors; error?: string };
      if (result.ok) {
        setStatus('sent');
        return;
      }
      setErrors(result.errors ?? {});
      setFailure(result.error ?? 'Please check the highlighted fields.');
      setStatus('error');
    } catch {
      setFailure('We could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <div className="dialog-backdrop">
      <div ref={panel} className="dialog instrument-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className="dialog-close" type="button" onClick={close} aria-label="Close consultation dialog">Close ×</button>
        {status === 'sent' ? <>
          <p className="eyebrow">Received</p>
          <h2 id={titleId} className="display-md">Thank you. Your request is with us.</h2>
          <p className="body-copy">We will reply by email to arrange a time. Until then, the sky keeps moving.</p>
          <button className="cta mt-8" type="button" onClick={close}>Return to the journey ↗</button>
        </> : <>
          <p className="eyebrow">{course ? `Course ${course.numeral}` : 'Consultation'}</p>
          <h2 id={titleId} className="display-md">{course ? <>Reserve a place on {course.title[0]} {course.title[1]}</> : 'Begin with a conversation.'}</h2>
          <p className="body-copy">{course ? `${course.duration} · ${course.lessons} · ${course.level}. Leave your details and we will send the next cohort dates.` : 'Tell us a little about what you would like to explore. A reading is an interpretation made with you, not a verdict delivered to you.'}</p>
          <form className="dialog-form" onSubmit={submit} noValidate>
            <Field label="Name" name="name" autoComplete="name" error={errors.name} required />
            <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} required />
            <label className="field-label" htmlFor="consult-focus">I would like to explore<select id="consult-focus" className="field-select" name="focus" defaultValue={course ? 'course' : 'combined'} aria-invalid={Boolean(errors.focus)} aria-describedby={errors.focus ? 'consult-focus-error' : undefined}>{FOCUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{errors.focus && <span id="consult-focus-error" className="form-error">{errors.focus}</span>}</label>
            {!course && <label className="field-label" htmlFor="consult-course">Course, if any<select id="consult-course" className="field-select" name="course" defaultValue=""><option value="">None in particular</option>{COURSES.map((item) => <option key={item.slug} value={item.slug}>{item.title.join(' ')}</option>)}</select></label>}
            <Field label="Anything we should know (optional)" name="message" as="textarea" error={errors.message} />
            <label className="honeypot" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
            {failure && <p className="form-error" role="alert">{failure}</p>}
            <CosmicButton type="submit" variant="solid" disabled={status === 'sending'}>{status === 'sending' ? 'Sending' : course ? 'Reserve my place' : 'Request a consultation'}</CosmicButton>
            <p className="instrument-note">No payment is taken here.</p>
          </form>
        </>}
      </div>
    </div>
  );
}

function Field({ label, name, error, as, ...props }: { label: string; name: string; error?: string; as?: 'input' | 'textarea' } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const descriptionId = `${id}-error`;
  return <label className="field-label" htmlFor={id}>{label}{as === 'textarea'
    ? <textarea id={id} className="field-textarea" name={name} maxLength={2000} aria-invalid={Boolean(error)} aria-describedby={error ? descriptionId : undefined} />
    : <input id={id} className="field-input" name={name} aria-invalid={Boolean(error)} aria-describedby={error ? descriptionId : undefined} {...props} />}{error && <span id={descriptionId} className="form-error">{error}</span>}</label>;
}
