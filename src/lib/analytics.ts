/**
 * ANALYTICS — thin wrapper around Vercel Analytics custom events.
 *
 * `@vercel/analytics` does not track in development mode, so `track()` is
 * a natural no-op locally. This wrapper adds:
 *   - A single typed entry point so event names stay consistent
 *   - A guard against runtime errors if the package isn't loaded
 *   - Centralised event names so they can be audited in one place
 *
 * All events are static-site-safe: no backend, no database. Vercel
 * Analytics collects them on its end and surfaces them in the dashboard
 * under "Custom Events".
 */

import { track } from '@vercel/analytics';

type EventName =
  | 'section_viewed'
  | 'skill_clicked'
  | 'project_opened'
  | 'interview_mode'
  | 'jd_analysed'
  | 'template_buy_clicked'
  | 'resume_printed'
  | 'profile_shared';

/**
 * Fire a custom analytics event. Safe to call anywhere — errors are
 * swallowed so analytics never breaks the UI.
 */
export function trackEvent(name: EventName, data?: Record<string, string | number | boolean>) {
  try {
    track(name, data);
  } catch {
    // Analytics should never break the user experience.
  }
}
