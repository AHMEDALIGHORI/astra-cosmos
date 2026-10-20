import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/brand';

export const alt = `${BRAND.name} — ${BRAND.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const font = await readFile(path.join(process.cwd(), 'src', 'assets', 'InstrumentSerif-Regular.ttf'));
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#050507', color: '#edebe5', padding: '66px 72px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', right: 54, top: 38, width: 520, height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: 420, height: 420, border: '1px solid rgba(217,183,126,.28)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, border: '1px solid rgba(237,235,229,.12)', borderRadius: '50%' }} />
        <div style={{ width: 176, height: 176, borderRadius: '50%', background: 'radial-gradient(circle at 38% 34%, #fff3d0 0%, #f3b562 28%, #c8502f 62%, rgba(200,80,47,0) 74%)', boxShadow: '0 0 80px rgba(243,181,98,.35)' }} />
        <div style={{ position: 'absolute', top: 54, right: 107, width: 21, height: 21, borderRadius: '50%', background: '#9fd3de', boxShadow: '0 0 28px rgba(159,211,222,.8)' }} />
      </div>
      <div style={{ position: 'relative', width: 690, display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#d9b77e', fontSize: 19, letterSpacing: 9, textTransform: 'uppercase' }}>{BRAND.name}</div>
        <div style={{ marginTop: 94, display: 'flex', flexDirection: 'column', fontFamily: 'Instrument Serif', fontSize: 112, lineHeight: 0.9, letterSpacing: -2 }}>
          <span>THE UNIVERSE</span><span>HAS A STORY.</span>
        </div>
        <div style={{ marginTop: 34, color: '#b7b5ae', fontSize: 32 }}>Yours is already being written.</div>
      </div>
    </div>,
    { ...size, fonts: [{ name: 'Instrument Serif', data: font, weight: 400, style: 'normal' }] },
  );
}
