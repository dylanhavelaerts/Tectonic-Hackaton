'use client';

import { useState } from 'react';

const CLAIM_ENUM = [
  'centenindex_applies_pc200',
  'jan2027_index_forecast_pc200',
];

export default function InboxTab({
  questions,
  user,
  projectId,
  onVerified,
}: {
  questions: any[];
  user: any;
  projectId: string;
  onVerified: () => void;
}) {
  const [verifying, setVerifying] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    claim: '',
    value: '',
    statement: '',
  });

  const myQuestions = questions.filter((q: any) => q.expertId === user.id && q.status === 'open');

  const handleVerify = async (questionId: string) => {
    if (!formData.claim || !formData.value || !formData.statement) {
      alert('Fill all fields');
      return;
    }

    setVerifying(questionId);
    try {
      const res = await fetch(`/api/questions/${questionId}/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ claim: '', value: '', statement: '' });
        onVerified();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(null);
    }
  };

  if (myQuestions.length === 0) {
    return <div className="text-slate-600">No open questions for you</div>;
  }

  return (
    <div className="space-y-4">
      {myQuestions.map((q: any) => (
        <div key={q.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-semibold text-slate-900 mb-2">{q.text}</p>

          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Claim
              </label>
              <select
                value={formData.claim}
                onChange={(e) =>
                  setFormData({ ...formData, claim: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="">Select...</option>
                {CLAIM_ENUM.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Value
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Statement
              </label>
              <textarea
                value={formData.statement}
                onChange={(e) =>
                  setFormData({ ...formData, statement: e.target.value })
                }
                maxLength={500}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                rows={2}
              />
            </div>

            <button
              onClick={() => handleVerify(q.id)}
              disabled={verifying === q.id}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              {verifying === q.id ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
