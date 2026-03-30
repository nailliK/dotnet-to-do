'use client';

import {signOut, useSession} from 'next-auth/react';
import {LogOutIcon} from '@/components/ui/icons';

export default function LogoutButton() {
  const {data: session} = useSession();

  if (!session) return null;

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <span className="text-sm opacity-70">{session.user?.name}</span>
      <button
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => signOut({callbackUrl: '/login'})}
        aria-label="Log out"
      >
        <LogOutIcon/>
      </button>
    </div>
  );
}
