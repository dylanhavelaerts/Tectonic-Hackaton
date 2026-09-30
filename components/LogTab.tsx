'use client';

export default function LogTab({ log }: { log: any[] }) {
  if (log.length === 0) {
    return <div className="text-slate-600">No activity yet</div>;
  }

  return (
    <div className="space-y-2">
      {log.map((entry: any, i: number) => (
        <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
          <p className="font-medium text-slate-900">{entry.action}</p>
          <p className="text-xs text-slate-600">
            {new Date(entry.at).toLocaleString()} · {entry.userId}
          </p>
        </div>
      ))}
    </div>
  );
}
