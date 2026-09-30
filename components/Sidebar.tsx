'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewProjectModal from './NewProjectModal';

export default function Sidebar({
  user,
  onSelectProject,
}: {
  user: any;
  onSelectProject: (id: string | null) => void;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          setProjects(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSelectProject = (id: string) => {
    setSelected(id);
    onSelectProject(id);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleProjectCreated = async () => {
    const res = await fetch('/api/projects');
    if (res.ok) {
      setProjects(await res.json());
    }
    setShowNewProject(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header: 48px with ripple mark + title + user chip */}
      <div className="h-12 px-4 border-b border-line flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Ripple mark: 3 concentric circles */}
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-ink">
            <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="font-semibold text-text">Ripple</span>
        </div>
        <div className="text-xs text-muted truncate">{user.name.split(' ')[0]} · {user.role}</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-4 space-y-4">
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-medium py-2 px-3 rounded-[4px] transition"
          >
            + New project
          </button>

          {loading ? (
            <p className="text-xs text-muted">Loading…</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted">No projects yet</p>
          ) : (
            <div className="space-y-1">
              {projects.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-[4px] transition ${
                    selected === p.id
                      ? 'bg-primary-subtle text-primary font-medium'
                      : 'text-text hover:bg-subtle'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-line shrink-0">
        <button
          onClick={handleLogout}
          className="w-full text-xs text-muted hover:text-text transition font-medium"
        >
          Log out
        </button>
      </div>

      {showNewProject && (
        <NewProjectModal
          user={user}
          onClose={() => setShowNewProject(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
