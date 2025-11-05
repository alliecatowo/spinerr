'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Library, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide specific buttons based on current page
  const isLibraryPage = pathname === '/library';
  const isSettingsPage = pathname === '/settings';

  // Hide entire nav if on library or settings page
  if (isLibraryPage || isSettingsPage) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/library')}
        className="h-8 px-3 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
      >
        <Library className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Library</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/settings')}
        className="h-8 px-3 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
      >
        <Settings className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Settings</span>
      </Button>
    </nav>
  );
}
