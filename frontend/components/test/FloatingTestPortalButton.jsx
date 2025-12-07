'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// No TypeScript interface — using JS now
export default function FloatingTestPortalButton({ userRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide button on test-related pages
  const isOnTestPage = pathname?.includes('/tests');

  if (isOnTestPage || !isVisible) {
    return null;
  }

  const testPortalUrl = `/${userRole}/dashboard/tests`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50 group"
        data-testid="floating-test-portal-button"
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <Button
          onClick={() => router.push(testPortalUrl)}
          size={isMobile ? 'default' : 'lg'}
          className="rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:scale-110"
          data-testid="test-portal-button"
        >
          <FileText className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-2 animate-pulse`} />
          <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
            Test Portal
          </span>
        </Button>

        {/* Tooltip for desktop */}
        {!isMobile && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Access Test Portal
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
      </motion.div>
    </AnimatePresence>
  );
}
