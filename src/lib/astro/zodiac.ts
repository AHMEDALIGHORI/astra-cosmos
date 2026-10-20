export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export interface Sign { id: string; name: string; short: string; element: Element; modality: Modality; ruler: string; dates: string; sun: string; moon: string; }
export const SIGNS: Sign[] = [
  { id: 'aries', name: 'Aries', short: 'ARI', element: 'fire', modality: 'cardinal', ruler: 'Mars', dates: '21 Mar – 19 Apr', sun: 'Direct, initiating, alive to the first move.', moon: 'Steadied by movement and honest beginnings.' },
  { id: 'taurus', name: 'Taurus', short: 'TAU', element: 'earth', modality: 'fixed', ruler: 'Venus', dates: '20 Apr – 20 May', sun: 'Patient, sensory, committed to what lasts.', moon: 'Steadied by ritual, touch and the tangible.' },
  { id: 'gemini', name: 'Gemini', short: 'GEM', element: 'air', modality: 'mutable', ruler: 'Mercury', dates: '21 May – 20 Jun', sun: 'Curious, quick, alive to the exchange of ideas.', moon: 'Steadied by language and an open window.' },
  { id: 'cancer', name: 'Cancer', short: 'CAN', element: 'water', modality: 'cardinal', ruler: 'Moon', dates: '21 Jun – 22 Jul', sun: 'Protective, remembering, guided by feeling.', moon: 'Steadied by home, kin and familiar tides.' },
  { id: 'leo', name: 'Leo', short: 'LEO', element: 'fire', modality: 'fixed', ruler: 'Sun', dates: '23 Jul – 22 Aug', sun: 'Radiant, expressive, generous with the heart.', moon: 'Steadied by recognition and creative play.' },
  { id: 'virgo', name: 'Virgo', short: 'VIR', element: 'earth', modality: 'mutable', ruler: 'Mercury', dates: '23 Aug – 22 Sep', sun: 'Attentive, discerning, devoted to the useful.', moon: 'Steadied by order and small acts of care.' },
  { id: 'libra', name: 'Libra', short: 'LIB', element: 'air', modality: 'cardinal', ruler: 'Venus', dates: '23 Sep – 22 Oct', sun: 'Relational, balanced, alert to beauty and proportion.', moon: 'Steadied by harmony and another point of view.' },
  { id: 'scorpio', name: 'Scorpio', short: 'SCO', element: 'water', modality: 'fixed', ruler: 'Mars · Pluto', dates: '23 Oct – 21 Nov', sun: 'Intense, perceptive, unafraid of transformation.', moon: 'Steadied by depth, trust and honest silence.' },
  { id: 'sagittarius', name: 'Sagittarius', short: 'SAG', element: 'fire', modality: 'mutable', ruler: 'Jupiter', dates: '22 Nov – 21 Dec', sun: 'Restless, searching, oriented toward a wider horizon.', moon: 'Steadied by space, humour and the next question.' },
  { id: 'capricorn', name: 'Capricorn', short: 'CAP', element: 'earth', modality: 'cardinal', ruler: 'Saturn', dates: '22 Dec – 19 Jan', sun: 'Disciplined, strategic, patient.', moon: 'Steadied by competence and a sense of control.' },
  { id: 'aquarius', name: 'Aquarius', short: 'AQR', element: 'air', modality: 'fixed', ruler: 'Saturn · Uranus', dates: '20 Jan – 18 Feb', sun: 'Independent, conceptual, unconventional.', moon: 'Steadied by distance and a little perspective.' },
  { id: 'pisces', name: 'Pisces', short: 'PSC', element: 'water', modality: 'mutable', ruler: 'Jupiter · Neptune', dates: '19 Feb – 20 Mar', sun: 'Porous, imaginative, compassionate.', moon: 'Steadied by quiet, music and solitude.' },
];
export const ELEMENT_COPY: Record<Element, { name: string; line: string }> = { fire: { name: 'Fire', line: 'Instinct, momentum, appetite.' }, earth: { name: 'Earth', line: 'Substance, patience, craft.' }, air: { name: 'Air', line: 'Thought, language, perspective.' }, water: { name: 'Water', line: 'Feeling, memory, intuition.' } };
export const signAt = (longitude: number) => SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)];
