import { NextResponse } from 'next/server';
import { COURSES } from '@/data/courses';

export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BIRTH_DATE = /^\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}$/;
const FOCUS = new Set(['birth-chart', 'numerology', 'combined', 'course']);
const COURSE_SLUGS = new Set(COURSES.map((course) => course.slug));

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }
  const data = parsed as Record<string, unknown>;

  // The hidden company field catches bots without telling them the form failed.
  if (String(data.company ?? '').trim()) return NextResponse.json({ ok: true });

  const errors: Record<string, string> = {};
  if (!String(data.name ?? '').trim()) errors.name = 'Please tell us your name.';
  if (!EMAIL.test(String(data.email ?? '').trim())) errors.email = 'Please enter a valid email address.';
  if (!FOCUS.has(String(data.focus ?? ''))) errors.focus = 'Please choose what you would like to explore.';
  const birthDate = String(data.birthDate ?? '').trim();
  if (birthDate && !BIRTH_DATE.test(birthDate)) errors.birthDate = 'Use the format DD / MM / YYYY.';
  const course = String(data.course ?? '').trim();
  if (course && !COURSE_SLUGS.has(course)) errors.course = 'Unknown course.';
  if (String(data.message ?? '').length > 2000) errors.message = 'Please keep your message under 2000 characters.';
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const payload = {
    name: String(data.name).trim(),
    email: String(data.email).trim(),
    focus: String(data.focus),
    birthDate: birthDate || undefined,
    course: course || undefined,
    message: String(data.message ?? '').trim() || undefined,
    source: String(data.source ?? 'site'),
    receivedAt: new Date().toISOString(),
  };
  const webhook = process.env.CONSULTATION_WEBHOOK_URL;
  if (!webhook) {
    console.info('[astra:consultation]', payload);
    return NextResponse.json({ ok: true });
  }

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'We could not send your request just now. Please try again in a moment.' }, { status: 502 });
  }
}
