'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronDown, Plus } from 'lucide-react';
import CountUp from '../CountUp';
import { Button } from './ui';
import { PanelSource, ProjectData } from './types';
import { fmtDate, scoreTone, TONE_BAR, TONE_TEXT, TYPE_LABEL } from '@/lib/format';

export default function SourcesTab({
  data,
  onAdd,
  onOpenAnswer,
}: {
  data: ProjectData;
  onAdd: () => void;
  onOpenAnswer: () => void;
}) {
  const { sources, conflicts, project } = data;

  if (sources.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          {project.isLead
            ? 'Add the documents you would normally check for this question.'
            : `No sources yet. ${project.leadName} adds them as project lead.`}
        </p>
        {project.isLead && (
          <Button onClick={onAdd}>
            <Plus size={16} strokeWidth={1.5} /> Add sources
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted flex-1">
          {sources.length} sources, ranked by trust
          {conflicts.length > 0 && (
            <>
              {' · '}
              <button onClick={onOpenAnswer} className="text-human hover:underline">
                {conflicts.length} open conflict{conflicts.length > 1 ? 's' : ''}
              </button>
            </>
          )}
        </p>
        {project.isLead && (
          <Button variant="secondary" onClick={onAdd}>
            <Plus size={16} strokeWidth={1.5} /> Add
          </Button>
        )}
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {sources.map((s, i) => (
          <SourceRow key={s.id} source={s} index={i} />
        ))}
      </ul>
    </div>
  );
}

function SourceRow({ source: s, index }: { source: PanelSource; index: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const tone = s.score ? scoreTone(s.score.total) : 'bad';
  const lowRow = s.suspicious || (s.score && s.score.total < 50);

  return (
    <motion.li
      layout={!reduce}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1], delay: index * 0.04 }}
      className={lowRow ? 'bg-bad-subtle' : ''}
    >
      <button
        onClick={() => !s.suspicious && setOpen(!open)}
        className="w-full flex items-start gap-3 py-2.5 px-1 text-left min-h-11"
        aria-expanded={open}
      >
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 text-[11px] font-mono uppercase text-muted">
            {TYPE_LABEL[s.type] ?? s.type}
            <span className="normal-case">{s.mode === 'live' ? 'live AI' : 'cached'}</span>
          </span>
          <span className="block text-sm font-medium text-text leading-snug mt-0.5">{s.title}</span>
          <span className="block text-xs text-muted mt-0.5">
            {s.owner ?? 'No owner'} · {fmtDate(s.lastEdited)}
          </span>
        </span>

        {s.suspicious ? (
          <span className="text-xs text-bad font-medium text-right w-24 pt-4">Suspicious, ignored</span>
        ) : (
          s.score && (
            <span className="w-14 flex flex-col items-end pt-1">
              <span className={`text-2xl font-semibold tabular-nums leading-none ${TONE_TEXT[tone]}`}>
                <CountUp value={s.score.total} />
              </span>
              <span className="mt-1.5 h-1 w-full bg-page rounded-sm overflow-hidden">
                <motion.span
                  className={`block h-full ${TONE_BAR[tone]}`}
                  initial={false}
                  animate={{ width: `${s.score.total}%` }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: [0.2, 0, 0, 1] }}
                />
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={`mt-1 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </span>
          )
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && s.score && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <dl className="px-1 pb-3 space-y-1">
              {s.score.why.map((w) => (
                <div key={w.factor} className="grid grid-cols-[88px_36px_1fr] gap-2 text-xs">
                  <dt className="text-muted">{w.factor}</dt>
                  <dd className="font-mono tabular-nums text-text text-right">+{w.points}</dd>
                  <dd className="text-text">{w.reason}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
