'use client';

import { useState } from 'react';
import { Button, inputClass, SectionLabel } from './ui';
import { InboxItem, postJson } from './types';
import { CLAIM_LABEL, fmtDate } from '@/lib/format';

export default function InboxList({ items, onChanged }: { items: InboxItem[]; onChanged: () => void }) {
  const open = items.filter((q) => q.status === 'open');
  const done = items.filter((q) => q.status === 'answered');

  if (items.length === 0) return <p className="text-sm text-muted">Nothing is waiting for you.</p>;

  return (
    <div className="space-y-6">
      {open.map((q) => (
        <VerifyForm key={q.id} item={q} onDone={onChanged} />
      ))}
      {done.length > 0 && (
        <section className="space-y-1">
          <SectionLabel>Answered</SectionLabel>
          <ul className="divide-y divide-line border-y border-line">
            {done.map((q) => (
              <li key={q.id} className="py-2 text-sm text-muted">
                {q.projectName} · asked by {q.askedByName}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function VerifyForm({ item, onDone }: { item: InboxItem; onDone: () => void }) {
  const claims = item.conflicts.length ? item.conflicts : [];
  const [claim, setClaim] = useState(claims[0]?.claim ?? 'centenindex_applies_pc200');
  const values = claims.find((c) => c.claim === claim)?.values ?? [];
  const [value, setValue] = useState(values[0] ?? '');
  const [statement, setStatement] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await postJson(`/api/questions/${item.id}/verify`, { claim, value, statement });
    setBusy(false);
    if (!res.ok) {
      setError('Could not save. The question may already be answered.');
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <p className="text-xs text-muted">
          From {item.askedByName} · {item.projectName} · {fmtDate(item.createdAt)}
        </p>
        <p className="text-sm text-text whitespace-pre-line mt-1">{item.text}</p>
      </div>

      {claims.map((c) => (
        <div key={c.claim} className="space-y-1.5">
          <SectionLabel>What the sources say · {CLAIM_LABEL[c.claim] ?? c.claim}</SectionLabel>
          {c.quotes.map((q) => (
            <div key={q.sourceId + q.value}>
              <blockquote className="bg-subtle border border-line rounded-[4px] px-3 py-2 font-mono text-[13px] leading-snug">
                <span className="text-muted mr-1">&ldquo;</span>
                {q.quote}
              </blockquote>
              <p className="text-xs text-muted mt-0.5">
                <span className="font-mono text-text">{q.value}</span> · {q.title}
              </p>
            </div>
          ))}
        </div>
      ))}

      <div className="border-t border-line pt-3 space-y-3">
        <label className="block space-y-1">
          <SectionLabel>Claim</SectionLabel>
          <select
            className={inputClass}
            value={claim}
            onChange={(e) => {
              setClaim(e.target.value);
              setValue(claims.find((c) => c.claim === e.target.value)?.values[0] ?? '');
            }}
          >
            {Object.entries(CLAIM_LABEL).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <SectionLabel>Correct value</SectionLabel>
          <input
            className={inputClass}
            list={`values-${item.id}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={100}
            required
          />
          <datalist id={`values-${item.id}`}>
            {values.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>
        <label className="block space-y-1">
          <SectionLabel>Your answer</SectionLabel>
          <textarea
            className={inputClass}
            rows={3}
            maxLength={500}
            placeholder="One sentence the team can rely on"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            required
          />
        </label>
        {error && <p className="text-sm text-bad">{error}</p>}
        <Button type="submit" className="w-full h-10" disabled={busy || !value.trim() || !statement.trim()}>
          {busy ? 'Saving…' : 'Verify answer'}
        </Button>
      </div>
    </form>
  );
}
