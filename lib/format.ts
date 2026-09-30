const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "8 Jan 2026" */
export function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "14:02" */
export function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export type Tone = 'ok' | 'warn' | 'bad';
export const scoreTone = (n: number): Tone => (n >= 80 ? 'ok' : n >= 50 ? 'warn' : 'bad');

export const TONE_TEXT: Record<Tone, string> = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad' };
export const TONE_BAR: Record<Tone, string> = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad' };

export const CLAIM_LABEL: Record<string, string> = {
  centenindex_applies_pc200: 'Centenindex applies to PC 200',
  jan2027_index_forecast_pc200: 'January 2027 PC 200 index forecast',
};

export const TYPE_LABEL: Record<string, string> = { doc: 'DOC', teams: 'TEAMS', client_agreement: 'AGREEMENT' };

export const firstName = (name: string) => name.split(' ')[0];
