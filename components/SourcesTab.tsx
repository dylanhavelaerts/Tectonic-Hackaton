'use client';

import { getSources } from '@/lib/store';

export default function SourcesTab({
  scores,
  projectId,
}: {
  scores: any[];
  projectId: string;
}) {
  if (scores.length === 0) {
    return <div className="text-slate-600">No sources analyzed yet</div>;
  }

  const sorted = [...scores].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      {sorted.map((score: any) => (
        <div
          key={score.sourceId}
          className={`p-4 rounded-lg border-l-4 ${
            score.total >= 80
              ? 'border-green-500 bg-green-50'
              : score.total >= 50
              ? 'border-amber-500 bg-amber-50'
              : 'border-red-500 bg-red-50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900">Source ID: {score.sourceId}</h3>
              <p className="text-sm text-slate-600">Score breakdown</p>
            </div>
            <div
              className={`text-2xl font-bold ${
                score.total >= 80
                  ? 'text-green-700'
                  : score.total >= 50
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {score.total}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-xs">
            {Object.entries(score.parts).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-white rounded p-2">
                <p className="font-semibold text-slate-900">{key}</p>
                <p className="text-slate-600">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-slate-700 space-y-1">
            {score.why.map((reason: string, i: number) => (
              <p key={i}>• {reason}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
