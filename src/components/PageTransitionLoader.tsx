import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

export function PageTransitionLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    // Only show loader if path actually changed
    if (location.pathname !== prevPath) {
      setIsLoading(true);
      
      // Show loader for 1.5 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPrevPath(location.pathname);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPath]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant="primary" />
        <p className="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

