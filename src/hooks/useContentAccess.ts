import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type AccessLevel = 'full' | 'partial' | 'loading';

interface ContentAccessResult {
  accessLevel: AccessLevel;
  isBot: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useContentAccess(): ContentAccessResult {
  const { user } = useAuth();
  const [isBot, setIsBot] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple client-side bot detection as fallback
    // The edge function does the real work for SSR/prerendering
    const checkAccess = async () => {
      try {
        // Check if we're being accessed by a known bot
        const ua = navigator.userAgent.toLowerCase();
        const botPatterns = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'facebot', 'twitterbot', 'linkedinbot'];
        const detectedBot = botPatterns.some(pattern => ua.includes(pattern));
        setIsBot(detectedBot);
      } catch (error) {
        console.error('Error checking content access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  const isAuthenticated = !!user;
  const accessLevel: AccessLevel = isLoading 
    ? 'loading' 
    : (isAuthenticated || isBot) 
      ? 'full' 
      : 'partial';

  return {
    accessLevel,
    isBot,
    isAuthenticated,
    isLoading,
  };
}
