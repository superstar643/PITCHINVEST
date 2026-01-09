import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
    <LoadingSpinner fullScreen />
  );
}

