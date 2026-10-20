import { gauss, mulberry32 } from '@/lib/math';

export function displayFontFamily() {
  if (typeof document === 'undefined') return 'Georgia, serif';
  return getComputedStyle(document.documentElement).getPropertyValue('--face-display').trim() || 'Georgia, serif';
}

export async function ensureDisplayFont() {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await document.fonts.load(`400 200px ${displayFontFamily()}`, '0123456789');
    await document.fonts.ready;
  } catch { /* The system serif remains available when the web font fails. */ }
}

/** Samples visible pixels from the loaded display face into a centered 3D point cloud. */
export function sampleGlyph(text: string, count: number, seed = 1) {
  const canvas = typeof document === 'undefined' ? null : document.createElement('canvas');
  const context = canvas?.getContext('2d', { willReadFrequently: true });
  if (!canvas || !context) return new Float32Array(count * 3);

  canvas.width = text.length > 1 ? 560 : 320;
  canvas.height = 320;
  const size = 300;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#fff';
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.font = `400 ${size}px ${displayFontFamily()}, Georgia, serif`;
  const metrics = context.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || size * .7;
  const descent = metrics.actualBoundingBoxDescent || 0;
  const glyphHeight = ascent + descent;
  context.fillText(text, canvas.width / 2, (canvas.height + ascent - descent) / 2);

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels: Array<[number, number]> = [];
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (image.data[(y * canvas.width + x) * 4 + 3] > 110) pixels.push([x, y]);
    }
  }

  const points = new Float32Array(count * 3);
  if (!pixels.length) return points;
  const random = mulberry32(seed * 7919 + text.charCodeAt(0));
  for (let i = 0; i < count; i += 1) {
    const [x, y] = pixels[Math.floor(random() * pixels.length)];
    points[i * 3] = (x - canvas.width / 2 + random() - .5) / glyphHeight;
    points[i * 3 + 1] = (canvas.height / 2 - y + random() - .5) / glyphHeight;
    points[i * 3 + 2] = gauss(random) * .008;
  }
  return points;
}
