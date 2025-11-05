'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide Library button when on library page
  const isLibraryPage = pathname === '/library';

  if (isLibraryPage) {
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
    </nav>
  );
}
