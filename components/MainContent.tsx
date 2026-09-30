'use client';

import { useState } from 'react';
import ProjectView from './ProjectView';

export default function MainContent({
  user,
  projectId,
}: {
  user: any;
  projectId: string | null;
}) {
  if (!projectId) {
    return (
      <div className="flex-1 bg-white p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Ripple</h2>
            <p className="text-slate-600 mb-2">
              Find the documents. Know which one to believe.
            </p>
            <p className="text-slate-500 text-sm">
              Select a project from the sidebar to get started.
            </p>
          </div>

          <div className="mt-12">
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h3 className="font-bold text-slate-900 mb-4">How it works:</h3>
              <ol className="space-y-3 text-slate-700 text-sm">
                <li>
                  <strong>1. Pick sources</strong> — sources the AI will extract claims from
                </li>
                <li>
                  <strong>2. Scores appear</strong> — sourced from recency, authority, and conflicts
                </li>
                <li>
                  <strong>3. Ask an expert</strong> — if the top score is &lt;80 or conflicts exist
                </li>
                <li>
                  <strong>4. Expert verifies</strong> — one verified fact recalculates all scores
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProjectView user={user} projectId={projectId} />;
}
