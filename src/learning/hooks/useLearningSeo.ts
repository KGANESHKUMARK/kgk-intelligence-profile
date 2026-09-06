/**
 * Route-level SEO metadata for Learning Hub pages. No new dependency
 * (react-helmet etc.) — just a small effect that sets document.title and
 * the description meta tag, restoring the previous values on unmount.
 */

import { useEffect } from 'react';

export function useLearningSeo(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Java Engineering Lab`;

    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? undefined;
    if (meta && description) meta.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.setAttribute('content', previousDescription);
    };
  }, [title, description]);
}
