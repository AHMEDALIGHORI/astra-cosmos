import { lerp } from './math';

const AU_KM = 1.496e8;
const LIGHT_YEAR_KM = 9.461e12;
const MILESTONES: Array<[number, number]> = [
  [0, 5.6 * AU_KM], [1, 2.2 * AU_KM], [1.17, .35 * AU_KM], [1.4, .013 * AU_KM],
  [1.68, .39 * AU_KM], [1.94, .72 * AU_KM], [2.14, AU_KM], [2.9, AU_KM],
  [3.07, 1.0026 * AU_KM], [3.28, 1.52 * AU_KM], [3.54, 5.2 * AU_KM],
  [3.77, 9.58 * AU_KM], [3.9, 19.2 * AU_KM], [3.99, 30.1 * AU_KM],
  [4.3, 4.2 * LIGHT_YEAR_KM], [4.9, 640 * LIGHT_YEAR_KM], [5.6, 980 * LIGHT_YEAR_KM],
  [7, 1100 * LIGHT_YEAR_KM], [7.5, 1344 * LIGHT_YEAR_KM], [8, 8200 * LIGHT_YEAR_KM],
  [8.64, 26670 * LIGHT_YEAR_KM],
];

export function distanceLabel(time: number) {
  if (time >= 11.5) return 'Origin';
  if (time > 8.66 && time < 11.5) return 'Uncharted';
  const nextIndex = MILESTONES.findIndex(([at]) => at >= time);
  if (nextIndex < 0) return '26,670 light-years';
  if (nextIndex === 0) return '5.60 AU';
  const [t0, d0] = MILESTONES[nextIndex - 1];
  const [t1, d1] = MILESTONES[nextIndex];
  const progress = Math.max(0, Math.min(1, (time - t0) / (t1 - t0)));
  const kilometers = Math.exp(lerp(Math.log(d0), Math.log(d1), progress));
  const au = kilometers / AU_KM;
  if (au < .1) return `${(kilometers / 1e6).toFixed(1)} million km`;
  if (au < 2000) return `${au.toFixed(2)} AU`;
  return `${(kilometers / LIGHT_YEAR_KM).toFixed(0)} light-years`;
}
