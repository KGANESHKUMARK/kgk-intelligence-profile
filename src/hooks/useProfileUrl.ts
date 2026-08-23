import { useEffect, useState } from 'react';

/** SSR-safe current URL — used by the QR code and share sheet. */
export function useProfileUrl() {
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.origin + window.location.pathname), []);
  return url;
}
