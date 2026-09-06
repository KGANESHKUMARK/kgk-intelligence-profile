import { useCallback, useEffect, useState } from 'react';
import { profile } from '../data/profile';
import { trackEvent } from '../lib/analytics';

/**
 * Share the profile via the Web Share API where available,
 * falling back to copying the URL to the clipboard.
 */
export function useShare() {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const t = setTimeout(() => setStatus('idle'), 2400);
    return () => clearTimeout(t);
  }, [status]);

  const share = useCallback(async () => {
    const url = window.location.href;
    const data: ShareData = {
      title: `${profile.name} — ${profile.title}`,
      text: profile.tagline,
      url,
    };

    try {
      if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data);
        setStatus('shared');
        trackEvent('profile_shared', { method: 'native' });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      trackEvent('profile_shared', { method: 'clipboard' });
    } catch (err) {
      // AbortError just means the user dismissed the native share sheet.
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        setStatus('copied');
        trackEvent('profile_shared', { method: 'clipboard' });
      } catch {
        setStatus('error');
      }
    }
  }, []);

  const message =
    status === 'copied'
      ? 'Profile link copied.'
      : status === 'shared'
        ? 'Profile shared.'
        : status === 'error'
          ? 'Could not copy link.'
          : '';

  return { share, status, message };
}
