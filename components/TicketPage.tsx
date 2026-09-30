import { Inbox, BookOpen, Users, Ticket } from 'lucide-react';

export const TICKET = {
  number: '48213',
  clientId: 'c-noord',
  clientName: 'Brasserie Noord BV',
  subject: 'How much do salaries above €4,000 rise in January 2027?',
};

const icon = { size: 16, strokeWidth: 1.5 };

const FIELDS: [string, string][] = [
  ['Ticket', `#${TICKET.number}`],
  ['Client', TICKET.clientName],
  ['Contact', 'Payroll manager'],
  ['Priority', 'High'],
  ['Channel', 'Email'],
  ['Received', '29 Sep 2026, 16:42'],
];

/** The host page the extension runs on: a plain internal support desk. */
export default function TicketPage() {
  return (
    <div className="flex min-h-full">
      <nav className="w-52 shrink-0 border-r border-line bg-surface py-4 text-sm">
        <p className="px-4 pb-3 font-semibold text-ink">Support desk</p>
        {[
          [Inbox, 'Team queue', '12'],
          [Ticket, 'My tickets', '4'],
          [Users, 'Clients', ''],
          [BookOpen, 'Knowledge base', ''],
        ].map(([Icon, label, count], i) => {
          const I = Icon as typeof Inbox;
          return (
            <div
              key={label as string}
              className={`flex items-center gap-2 px-4 h-9 ${i === 1 ? 'bg-primary-subtle text-primary font-medium' : 'text-text'}`}
            >
              <I {...icon} />
              <span className="flex-1">{label as string}</span>
              <span className="text-xs text-muted tabular-nums">{count as string}</span>
            </div>
          );
        })}
      </nav>

      <main className="flex-1 p-6 min-w-0">
        <div className="max-w-3xl bg-surface border border-line rounded-[4px]">
          <div className="px-5 py-4 border-b border-line flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted font-mono">#{TICKET.number}</p>
              <h1 className="text-lg font-semibold text-ink mt-1">{TICKET.subject}</h1>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-warn-soft text-warn font-medium">Open</span>
          </div>

          <dl className="grid grid-cols-3 gap-x-6 gap-y-3 px-5 py-4 border-b border-line text-sm">
            {FIELDS.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className={`mt-0.5 ${k === 'Priority' ? 'text-bad font-medium' : 'text-text'}`}>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="px-5 py-5 text-[15px] leading-relaxed max-w-[70ch] space-y-3">
            <p>Hello,</p>
            <p>
              We are preparing the salary budget for 2027. Our pay policy side letter from 2024 says that everyone,
              including management above €4,000 gross, gets the full January indexation on their entire salary.
            </p>
            <p>
              A colleague mentioned a new &ldquo;centenindex&rdquo;. How much do salaries above €4,000 rise in January
              2027, and does our side letter still apply?
            </p>
            <p>
              Kind regards,
              <br />
              Payroll manager, {TICKET.clientName}
            </p>
          </div>

          <div className="px-5 py-4 border-t border-line">
            <div className="h-20 border border-line rounded-[4px] bg-subtle px-3 py-2 text-sm text-muted">Write a reply…</div>
            <div className="flex justify-end mt-3">
              <span className="h-8 px-3 inline-flex items-center rounded-[4px] bg-primary text-white text-sm font-medium opacity-60">
                Send reply
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
