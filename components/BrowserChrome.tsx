'use client';

import { ArrowLeft, ArrowRight, Headset, Lock, MoreVertical, Plus, Puzzle, RotateCw, Star, X } from 'lucide-react';
import RippleMark from './RippleMark';

const icon = { size: 16, strokeWidth: 1.5 };

/** Fake Chrome window: tab strip, toolbar with extension icons, page + docked side panel. */
export default function BrowserChrome({
  initials,
  panelOpen,
  onTogglePanel,
  page,
  panel,
}: {
  initials: string;
  panelOpen: boolean;
  onTogglePanel: () => void;
  page: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-[#dfe3e8] text-text">
      {/* Tab strip */}
      <div className="h-10 flex items-end gap-1 px-2 shrink-0">
        <div className="h-8 w-60 bg-surface rounded-t-lg px-3 flex items-center gap-2 text-xs">
          <Headset {...icon} size={14} className="text-primary" />
          <span className="truncate flex-1">#48213 · Salary rise January 2027</span>
          <X {...icon} size={14} className="text-muted" />
        </div>
        <div className="h-8 w-44 px-3 flex items-center gap-2 text-xs text-muted">
          <span className="w-3.5 h-3.5 rounded-sm bg-line" />
          <span className="truncate">Payroll calendar 2027</span>
        </div>
        <Plus {...icon} className="text-muted mb-2 ml-1" />
        <div className="ml-auto mb-2 flex items-center gap-4 pr-2 text-muted">
          <span className="w-3 h-px bg-muted" />
          <span className="w-2.5 h-2.5 border border-muted" />
          <X {...icon} size={14} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-11 bg-surface flex items-center gap-3 px-3 border-b border-line shrink-0">
        <ArrowLeft {...icon} className="text-muted" />
        <ArrowRight {...icon} className="text-line" />
        <RotateCw {...icon} className="text-muted" />
        <div className="flex-1 h-8 bg-page rounded-lg flex items-center gap-2 px-3 text-[13px]">
          <Lock {...icon} size={13} className="text-muted" />
          <span className="font-mono text-text">support.internal/tickets/48213</span>
          <Star {...icon} size={14} className="text-muted ml-auto" />
        </div>
        <button
          onClick={onTogglePanel}
          title="Ripple"
          aria-pressed={panelOpen}
          className={`h-8 w-8 flex items-center justify-center rounded-[4px] transition-colors ${
            panelOpen ? 'bg-primary-soft' : 'hover:bg-page'
          }`}
        >
          <RippleMark size={18} />
        </button>
        <Puzzle {...icon} className="text-muted" />
        <span className="w-7 h-7 rounded-full bg-ink text-white text-[11px] font-medium flex items-center justify-center">
          {initials}
        </span>
        <MoreVertical {...icon} className="text-muted" />
      </div>

      {/* Page + side panel */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 overflow-auto bg-page">{page}</div>
        {panelOpen && (
          <aside className="w-[420px] shrink-0 bg-surface border-l border-line flex flex-col min-h-0">{panel}</aside>
        )}
      </div>
    </div>
  );
}
