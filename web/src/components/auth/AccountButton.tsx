"use client";

import { useState } from 'react';
import { User, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';

export function AccountButton() {
  const { user, isAnonymous, signOutUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOutUser();
  };

  return (
    <>
      {/* Account Button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isAnonymous) {
              setShowAuthModal(true);
            } else {
              setShowMenu(!showMenu);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-gray-200/60 dark:border-neutral-800/60 shadow-lg hover:shadow-xl transition-all"
        >
          {isAnonymous ? (
            <>
              <UserCircle className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                Sign in
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                {user?.email?.split('@')[0] || 'Account'}
              </span>
            </>
          )}
        </motion.button>

        {/* Dropdown menu for authenticated users */}
        <AnimatePresence>
          {showMenu && !isAnonymous && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-48 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800/60 shadow-xl z-50 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-500 mt-0.5">
                    {user?.isAnonymous ? 'Anonymous' : 'Signed in'}
                  </p>
                </div>

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
