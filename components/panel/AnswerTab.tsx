'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Copy, Mail, MessageSquare } from 'lucide-react';
import CountUp from '../CountUp';
import { Button, buttonClass, inputClass, SectionLabel } from './ui';
import { Me, postJson, ProjectData } from './types';
import { CLAIM_LABEL, firstName, fmtDate, scoreTone, TONE_TEXT } from '@/lib/format';

const icon = { size: 16, strokeWidth: 1.5 };

export default function AnswerTab({ data, me, onAsked }: { data: ProjectData; me: Me; onAsked: () => void }) {
  const { facts, conflicts, sources, suggestedExpert: expert, questions, project } = data;
  const reduce = useReducedMotion();
  const title = (id: string) => sources.find((s) => s.id === id)?.title ?? id;
  const scoreOf = (id: string) => sources.find((s) => s.id === id)?.score?.total;
  const top = sources.find((s) => s.score);
  const topScore = top?.score?.total ?? 0;

  const firstConflict = conflicts[0];
  const [text, setText] = useState(
    firstConflict
      ? `${project.question}\n\nOur sources disagree on "${CLAIM_LABEL[firstConflict.claim] ?? firstConflict.claim}": ${firstConflict.values.join(' vs ')}. Which one applies?`
      : project.question
  );
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const waiting = questions.find((q) => q.status === 'open' && q.expertId === expert.id);
  const prominent = topScore < 80 || conflicts.length > 0;

  // Deep links carry no client details.
  const linkText = `Hi ${firstName(expert.name)}, I have an open question for you in Ripple about indexation. Could you check your Ripple inbox?`;
  const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(expert.email)}&message=${encodeURIComponent(linkText)}`;
  const mailUrl = `mailto:${expert.email}?subject=${encodeURIComponent('Question in Ripple')}&body=${encodeURIComponent(linkText)}`;

  const ask = async () => {
    setBusy(true);
    await postJson(`/api/projects/${project.id}/questions`, { text, expertId: expert.id });
    setBusy(false);
    onAsked();
  };

  if (sources.length === 0) {
    return <p className="text-sm text-muted">Add sources first. The answer is built from what they say.</p>;
  }

  return (
    <div className="space-y-5">
      {/* Verified answers */}
      <AnimatePresence initial={false}>
        {facts.map((f) => (
          <motion.section
            key={f.id}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, backgroundColor: 'var(--color-ok-soft)' }}
            animate={{ height: 'auto', opacity: 1, backgroundColor: 'var(--color-ok-subtle)' }}
            transition={{ duration: 0.3, backgroundColor: { duration: 1.2 } }}
            className="border border-ok/30 rounded-[4px] overflow-hidden"
          >
            <div className="p-3 space-y-1">
              <p className="text-xs text-ok font-medium">
                Verified by {f.verifiedByName} · {fmtDate(f.at)}
              </p>
              <p className="text-sm text-text">{f.statement}</p>
              <p className="text-xs text-ok">
                {CLAIM_LABEL[f.claim] ?? f.claim}: <span className="font-mono">{f.value}</span>
              </p>
            </div>
          </motion.section>
        ))}
      </AnimatePresence>

      {/* Most trusted source */}
      {top?.score && (
        <section className="space-y-1">
          <SectionLabel>Most trusted source</SectionLabel>
          <div className="flex items-baseline gap-3">
            <p className="flex-1 text-sm text-text">{top.title}</p>
            <span className={`text-2xl font-semibold tabular-nums ${TONE_TEXT[scoreTone(topScore)]}`}>
              <CountUp value={topScore} />
            </span>
          </div>
        </section>
      )}

      {/* Conflicts with exact quotes */}
      {conflicts.map((c) => (
        <section key={c.claim} className="space-y-2">
          <SectionLabel>Conflict · {CLAIM_LABEL[c.claim] ?? c.claim}</SectionLabel>
          <p className="text-sm text-text">
            {c.values
              .map((v) => {
                const n = c.quotes.filter((q) => q.value === v).length;
                return `${n} source${n > 1 ? 's' : ''} say "${v}"`;
              })
              .join(', ')}
            .
          </p>
          <ul className="space-y-2">
            {c.quotes.map((q) => (
              <li key={q.sourceId + q.value}>
                <blockquote className="bg-subtle border border-line rounded-[4px] px-3 py-2 font-mono text-[13px] leading-snug text-text">
                  <span className="text-muted mr-1">&ldquo;</span>
                  {q.quote}
                </blockquote>
                <p className="text-xs text-muted mt-1 flex gap-2">
                  <span className="font-mono text-text">{q.value}</span>
                  <span className="flex-1 truncate">{title(q.sourceId)}</span>
                  <span className="tabular-nums">{scoreOf(q.sourceId)}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Ask the expert */}
      <section className={`space-y-2 ${prominent ? 'border border-human/40 bg-human-subtle rounded-[4px] p-3' : ''}`}>
        <SectionLabel>{prominent ? 'An expert needs to decide' : 'Ask an expert'}</SectionLabel>
        <p className="text-sm text-text">
          {expert.name} <span className="text-muted">· {expert.team}, expertise matches indexation</span>
        </p>

        {waiting ? (
          <p className="text-sm text-human font-medium">
            Waiting for {firstName(expert.name)} since {fmtDate(waiting.createdAt)}.
          </p>
        ) : (
          <>
            <textarea
              className={inputClass}
              rows={5}
              maxLength={500}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button variant="human" className="w-full h-10" disabled={busy || !text.trim()} onClick={ask}>
              {busy ? 'Sending…' : `Ask ${firstName(expert.name)}`}
            </Button>
          </>
        )}

        <div className="grid grid-cols-3 gap-2">
          <a href={teamsUrl} target="_blank" rel="noreferrer" className={buttonClass('secondary')}>
            <MessageSquare {...icon} /> Teams
          </a>
          <a href={mailUrl} className={buttonClass('secondary')}>
            <Mail {...icon} /> Email
          </a>
          <Button
            variant="secondary"
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            <Copy {...icon} /> {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </section>

      {questions.length > 0 && (
        <section className="space-y-1">
          <SectionLabel>Asked</SectionLabel>
          <ul className="divide-y divide-line border-y border-line">
            {questions.map((q) => (
              <li key={q.id} className="py-2 text-sm flex gap-2">
                <span className="flex-1 text-text">{q.expertName}</span>
                <span className={q.status === 'open' ? 'text-human' : 'text-ok'}>
                  {q.status === 'open' ? 'Open' : 'Answered'}
                </span>
                <span className="text-muted text-xs pt-0.5">{fmtDate(q.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {me.id === expert.id && waiting && <p className="text-xs text-muted">This question is in your Inbox tab.</p>}
    </div>
  );
}
