import { describe, it, expect } from 'vitest';
import { findConflicts, scoreSource, TODAY } from './scoring';
import { Source, User, VerifiedFact } from './types';
import usersJson from '../data/users.json';
import sourcesJson from '../data/sources.json';

const users = usersJson as User[];
const sources = sourcesJson as Source[];
const picked = ['d-01', 'd-05', 'k-01', 'd-02', 'm-01'].map((id) => sources.find((s) => s.id === id)!);

const fact: VerifiedFact = {
  id: 'f-1',
  projectId: 'p-1',
  claim: 'centenindex_applies_pc200',
  value: 'yes',
  statement: 'Centenindex overrides the side letter from Jan 2027.',
  verifiedBy: 'u-pieter',
  at: '2026-09-30T10:00:00Z',
};

function scores(facts: VerifiedFact[]) {
  const conflicts = findConflicts(
    picked.map((s) => ({ sourceId: s.id, claims: s.cachedClaims })),
    facts
  );
  const ctx = {
    clientId: 'c-noord',
    clientCountry: 'BE',
    leadId: 'u-lotte',
    users,
    today: TODAY,
    facts,
    openConflictClaims: conflicts.map((c) => c.claim),
  };
  return Object.fromEntries(picked.map((s) => [s.id, scoreSource(s, ctx).total]));
}

describe('scoring', () => {
  it('before verify: d-05 is top at 82', () => {
    const s = scores([]);
    expect(s).toEqual({ 'd-05': 82, 'd-01': 77, 'm-01': 77, 'k-01': 67, 'd-02': 47 });
    expect(Math.max(...Object.values(s))).toBe(s['d-05']);
  });

  it('after verify: d-05 = 90', () => {
    expect(scores([fact])['d-05']).toBe(90);
  });

  it('after verify: contradicting sources capped at 40', () => {
    const s = scores([fact]);
    for (const id of ['d-01', 'm-01', 'k-01', 'd-02']) expect(s[id]).toBe(40);
  });
});
