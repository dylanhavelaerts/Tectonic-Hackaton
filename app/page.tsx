'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrowserChrome from '@/components/BrowserChrome';
import TicketPage from '@/components/TicketPage';
import SidePanel from '@/components/panel/SidePanel';
import type { Me } from '@/components/panel/types';

export default function Home() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' }).then(async (res) => {
      if (!res.ok) router.push('/login');
      else setMe(await res.json());
    });
  }, [router]);

  if (!me) return <div className="h-screen bg-page" />;

  const initials = me.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <BrowserChrome
      initials={initials}
      panelOpen={panelOpen}
      onTogglePanel={() => setPanelOpen((o) => !o)}
      page={<TicketPage />}
      panel={<SidePanel me={me} onClose={() => setPanelOpen(false)} />}
    />
  );
}
