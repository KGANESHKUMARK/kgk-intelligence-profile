import type { LearningTopic } from '../../../types';

export const reactInternalsTopics: LearningTopic[] = [
  {
    id: 'react-babel-bundling',
    technology: 'react',
    title: 'Babel, JSX Compilation & Bundling (Vite/Webpack)',
    category: 'Internals & Build',
    slug: 'react-babel-bundling',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Babel/SWC transforms JSX into function calls and modern JS into browser-compatible code. Vite/Webpack bundles modules, tree-shakes dead code, and code-splits for performance.',
    mentalModel:
      'JSX is NOT valid JavaScript. A compiler (Babel/SWC/TypeScript) converts <App/> into jsx(App, {}) at build time. A bundler (Vite/Webpack) combines all modules into optimized chunks for the browser.',
    memoryTip:
      'Babel = JSX/TS → JS. Tree shaking = remove unused exports. Code splitting = lazy(() => import("./Page")). Vite = ESM dev (instant HMR) + Rollup prod build.',
    keyTerms: ['Babel', 'SWC', 'JSX transform', 'tree shaking', 'code splitting', 'dynamic import', 'Vite', 'Webpack', 'HMR', 'source maps', 'polyfills'],
    interviewAnswer: `The React build pipeline:

**1. Compilation (Babel/SWC/TSC):**
JSX: <Button onClick={fn}>Save</Button> → jsx(Button, { onClick: fn, children: "Save" }). The "automatic runtime" (React 17+) imports jsx from 'react/jsx-runtime' — no need for import React. SWC (Rust-based) is 20-70x faster than Babel — Vite and Next.js use SWC by default.

**2. Bundling (Vite/Webpack):**
Resolves all import/require statements into a dependency graph. Tree shaking: removes unused exports (ESM only — not CommonJS). Code splitting: React.lazy(() => import('./AccountPage')) creates a separate chunk loaded on demand. Chunk hashing: output files get content hashes (app.abc123.js) for cache-busting.

**3. Dev vs Prod:**
Vite dev: serves ESM modules directly (no bundling) → instant HMR. Vite prod: Rollup bundles + minifies + tree-shakes. Webpack: bundles in both dev and prod (slower dev but mature ecosystem). Source maps: map minified code back to original source for debugging.

**4. Polyfills:**
core-js polyfills for older browsers. @vitejs/plugin-legacy for Vite. browserslist config defines target browsers. Modern-only builds skip polyfills for smaller bundles.`,
    codeExample: `// What Babel/SWC actually does:
// Input (JSX):
const el = <Button variant="primary" onClick={handlePay}>Pay Now</Button>;

// Output (JavaScript):
import { jsx } from 'react/jsx-runtime';
const el = jsx(Button, { variant: "primary", onClick: handlePay, children: "Pay Now" });

// Vite config for production optimization
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],       // separate vendor chunk
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    sourcemap: true,  // enable source maps for debugging
  },
});`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Not enabling tree shaking — importing entire lodash instead of lodash/debounce.',
      'No code splitting — entire app loads upfront, 3MB JS bundle blocks first paint.',
      'Disabling source maps in production — impossible to debug production errors.',
      'Using CommonJS (require) in a Vite/ESM project — breaks tree shaking.',
    ],
    seniorInsight: 'Senior engineers own the build pipeline. Know how to split vendor chunks (react, react-dom separate), analyze bundle size (rollup-plugin-visualizer), set up environment variables, and configure CI builds. A 2MB bundle that could be 400KB is a performance bug.',
    aiAwareness: {
      strongAnswerShouldMention: ['JSX → jsx() function call', 'automatic runtime', 'tree shaking ESM only', 'code splitting lazy import', 'SWC faster than Babel', 'source maps'],
      weakAnswer: 'Babel converts JSX to JavaScript.',
      likelyFollowUp: ['What is tree shaking and why does it need ESM?', 'How do you analyze bundle size?', 'Vite vs Webpack — when to choose which?'],
    },
    relatedTopics: ['react-jsx', 'react-code-splitting'],
    references: [
      { title: 'Vite — Why Vite', url: 'https://vite.dev/guide/why', source: 'vite.dev', type: 'official' },
    ],
  },

  {
    id: 'react-storage-cookies',
    technology: 'react',
    title: 'Storage: httpOnly Cookies, localStorage, sessionStorage & Security',
    category: 'Internals & Build',
    slug: 'react-storage-cookies',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'httpOnly cookies are invisible to JavaScript (XSS-proof for tokens). localStorage persists forever. sessionStorage dies with the tab. Choose based on security threat model.',
    mentalModel:
      'httpOnly cookie = locked safe (JavaScript cannot read it). localStorage = open drawer (any script can read it). sessionStorage = whiteboard (erased when tab closes).',
    memoryTip:
      'Tokens → httpOnly Secure SameSite=Strict cookie (server sets it). Preferences → localStorage. Session wizard state → sessionStorage. NEVER put tokens in localStorage.',
    keyTerms: ['httpOnly', 'Secure', 'SameSite', 'localStorage', 'sessionStorage', 'XSS', 'CSRF', 'cookie attributes', 'token storage'],
    interviewAnswer: `**localStorage**: persistent, ~5-10MB, survives tab/browser close. Accessible by ANY JavaScript on the same origin — if an XSS attack injects a script, it can read localStorage.getItem("access_token") and exfiltrate tokens. Use for: user preferences, theme, non-sensitive cache.

**sessionStorage**: same API, but scoped to the browser tab. Cleared when the tab closes. Each tab gets its own copy. Use for: multi-step form drafts, tab-specific state.

**httpOnly cookies**: set by the server with Set-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict; Path=/api. HttpOnly = JavaScript cannot read it (document.cookie returns nothing). Secure = only sent over HTTPS. SameSite=Strict = not sent on cross-site requests (CSRF protection). The browser automatically attaches it to every request to the origin. Use for: access tokens, refresh tokens, session IDs.

**Security comparison:**
| | localStorage | httpOnly cookie |
|---|---|---|
| XSS attack | Token stolen ❌ | Token invisible to JS ✅ |
| CSRF attack | Not sent auto ✅ | Sent auto → need SameSite ⚠️ |

**Banking best practice**: access token in httpOnly Secure SameSite=Strict cookie. Refresh token in a separate httpOnly cookie with path=/auth/refresh. CSRF token in a meta tag or custom header. NEVER store tokens in localStorage.`,
    codeExample: `// Server sets the token as httpOnly cookie (Express example)
res.cookie('access_token', jwt, {
  httpOnly: true,   // JavaScript CANNOT read this
  secure: true,     // HTTPS only
  sameSite: 'strict', // not sent on cross-site requests
  maxAge: 15 * 60 * 1000,  // 15 minutes
  path: '/api',     // only sent to /api/* endpoints
});

// React: credentials: 'include' tells fetch to send cookies
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // send httpOnly cookies automatically
});

// Anti-pattern: NEVER do this in banking apps
localStorage.setItem('access_token', jwt);  // XSS can steal this!

// sessionStorage for form draft (safe — non-sensitive, tab-scoped)
function useFormDraft<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Storing JWT in localStorage — any XSS attack can steal it. Use httpOnly cookies.',
      'Not setting SameSite on cookies — vulnerable to CSRF attacks.',
      'Forgetting withCredentials: true in Axios — httpOnly cookies are not sent.',
      'Using cookies for large data (preferences, cache) — cookies are sent on EVERY request (4KB limit).',
      'Assuming sessionStorage is shared across tabs — each tab has its own copy.',
    ],
    seniorInsight: 'In banking, token storage is a security audit item. httpOnly + Secure + SameSite=Strict is the only acceptable answer. localStorage for tokens is a compliance violation. If the interviewer asks "where do you store the JWT?", the answer is "I don\'t store it in JavaScript — the server sets it as an httpOnly cookie."',
    aiAwareness: {
      strongAnswerShouldMention: ['httpOnly = invisible to JS', 'Secure = HTTPS only', 'SameSite = CSRF protection', 'localStorage = XSS vulnerable', 'withCredentials for cookies'],
      weakAnswer: 'I store the token in localStorage.',
      likelyFollowUp: ['How does SameSite prevent CSRF?', 'How do you handle token refresh with httpOnly cookies?', 'What is the CSRF double-submit pattern?'],
    },
    relatedTopics: ['react-security-rbac', 'react-axios-http'],
    references: [
      { title: 'OWASP — Session Management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html', source: 'OWASP', type: 'documentation' },
    ],
  },

  {
    id: 'react-cdn-performance',
    technology: 'react',
    title: 'CDN, Caching Strategy & Core Web Vitals',
    category: 'Internals & Build',
    slug: 'react-cdn-performance',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'CDN serves static assets from edge nodes close to users. Content hashes enable aggressive caching. Core Web Vitals (LCP, FID, CLS) measure real user experience.',
    mentalModel:
      'CDN = copies of your JS/CSS/images at 200 locations worldwide. Cache-Control with content hashes = files cached forever, new deploy = new hash = fresh file. CWV = Google\'s performance report card.',
    memoryTip:
      'index.html: no-cache (always check for new version). app.abc123.js: immutable, max-age=1y (hash changes on deploy). Images/fonts: max-age=1y. LCP < 2.5s, FID < 100ms, CLS < 0.1.',
    keyTerms: ['CDN', 'Cache-Control', 'content hash', 'immutable', 'LCP', 'FID', 'CLS', 'preload', 'prefetch', 'lazy loading', 'image optimization'],
    interviewAnswer: `**CDN Strategy:**
Deploy built assets (JS, CSS, images, fonts) to a CDN (CloudFront, Cloudflare, Akamai). index.html is served with Cache-Control: no-cache (always fetch latest to get new chunk references). JS/CSS with content hashes (app.abc123.js) are served with Cache-Control: public, max-age=31536000, immutable — cached for 1 year, new deploy = new hash. Result: returning users load the entire app from CDN cache in <100ms.

**Core Web Vitals:**
LCP (Largest Contentful Paint) < 2.5s: preload hero image, inline critical CSS, SSR/streaming for above-the-fold content.
FID/INP (First Input Delay / Interaction to Next Paint) < 100ms: defer non-critical JS, use startTransition for expensive renders, code-split routes.
CLS (Cumulative Layout Shift) < 0.1: set width/height on images, reserve space for dynamic content, use CSS containment.

**Performance toolkit:**
- Lighthouse CI in pipeline — fail build if LCP > 3s.
- Bundle analyzer (rollup-plugin-visualizer) — find and eliminate bloat.
- Image optimization: next/image or @vite-plugin-image for WebP/AVIF, lazy loading with loading="lazy".
- Font optimization: font-display: swap, preload critical fonts, subset fonts.
- Prefetching: <link rel="prefetch"> for likely next pages.`,
    codeExample: `// Nginx CDN headers for React SPA
# index.html — always check for updates
location = /index.html {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# Hashed assets — cache forever (hash changes on deploy)
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

// React: lazy loading images + prefetching routes
<img src={heroUrl} loading="eager" fetchPriority="high" />  {/* LCP image: load immediately */}
<img src={belowFold} loading="lazy" />  {/* below fold: lazy load */}

// Prefetch the next likely page
<link rel="prefetch" href="/assets/AccountDetail-abc123.js" />

// Measure Core Web Vitals in production
import { onLCP, onFID, onCLS } from 'web-vitals';
onLCP(metric => analytics.send('LCP', metric.value));
onFID(metric => analytics.send('FID', metric.value));
onCLS(metric => analytics.send('CLS', metric.value));`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Caching index.html with max-age — users see the old version until cache expires.',
      'No content hashes on assets — users get stale JS/CSS after deploy.',
      'Not lazy-loading below-fold images — loads 50 images upfront, kills LCP.',
      'Giant unoptimized PNG hero image — use WebP/AVIF, compress, set explicit dimensions.',
      'No Lighthouse CI — performance regressions go unnoticed until production.',
    ],
    seniorInsight: 'Senior engineers own performance from build to CDN to browser. Set up Lighthouse CI in the pipeline, monitor Core Web Vitals with web-vitals library, and review the bundle analyzer on every PR that adds a dependency. A 500KB import of moment.js when you only need formatDate is a senior-level catch.',
    aiAwareness: {
      strongAnswerShouldMention: ['index.html no-cache', 'assets immutable+hash', 'LCP/FID/CLS thresholds', 'lazy loading images', 'Lighthouse CI'],
      weakAnswer: 'Put files on a CDN for faster loading.',
      likelyFollowUp: ['How do you cache-bust after deployment?', 'What causes CLS and how do you fix it?', 'How do you measure CWV in production?'],
    },
    relatedTopics: ['react-code-splitting', 'react-babel-bundling'],
    references: [
      { title: 'web.dev — Core Web Vitals', url: 'https://web.dev/vitals/', source: 'web.dev', type: 'documentation' },
    ],
  },
];
