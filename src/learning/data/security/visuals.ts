import type { LearningVisual } from '../../types';
export const securityVisuals: LearningVisual[] = [
  {
    id: 'sec-oauth-flow',
    topicId: 'sec-oauth-oidc',
    type: 'flow',
    title: 'OAuth 2.0 Authorization Code + PKCE Flow',
    description: 'Step-by-step token acquisition for a public client (SPA or mobile app)',
    nodes: [
      { id: 's1', label: '1. Generate PKCE pair', description: 'App: code_verifier = random(). code_challenge = BASE64URL(SHA256(verifier))' },
      { id: 's2', label: '2. Redirect to IdP', description: '/authorize?code_challenge=X&code_challenge_method=S256&state=CSRF_TOKEN' },
      { id: 's3', label: '3. User authenticates', description: 'IdP shows login form. User enters credentials. Consent screen.' },
      { id: 's4', label: '4. Auth code returned', description: 'IdP redirects: callback?code=AUTH_CODE&state=CSRF_TOKEN. App verifies state.' },
      { id: 's5', label: '5. Token exchange', description: 'POST /token with code + code_verifier (not challenge). Server verifies SHA256(verifier)==challenge.' },
      { id: 's6', label: '6. Tokens issued', description: 'access_token (5 min) + id_token (who you are) + refresh_token (days).' },
    ],
    memoryTip: 'PKCE = Proof Key for Code Exchange. The code_verifier is only in the app — intercepting the code is useless without it.',
  },
  {
    id: 'sec-jwt-anatomy',
    topicId: 'sec-jwt',
    type: 'comparison',
    title: 'JWT Structure & Validation',
    description: 'What a JWT contains and how a resource server validates it',
    columns: [
      {
        label: 'JWT Structure (3 parts, base64url)',
        nodes: [
          { id: 'h', label: 'Header', description: '{"alg":"RS256","typ":"JWT"} — algorithm + type. NEVER accept alg=none.' },
          { id: 'p', label: 'Payload (Claims)', description: '{"sub":"USR-001","iss":"https://idp.bank.com","aud":"payment-service","exp":1735689600,...}' },
          { id: 's', label: 'Signature', description: 'RS256: signed with IdP private key. Verify with public key from JWKS endpoint.' },
        ],
      },
      {
        label: 'Validation Checklist',
        nodes: [
          { id: 'v1', label: 'Signature valid?', description: 'Fetch public key from JWKS URI. Verify signature.' },
          { id: 'v2', label: 'exp > now?', description: 'Reject expired tokens. Allow 60s clock skew.' },
          { id: 'v3', label: 'iss = expected IdP?', description: 'Reject tokens from unknown issuers.' },
          { id: 'v4', label: 'aud = this service?', description: 'Reject tokens not intended for this API.' },
          { id: 'v5', label: 'alg in whitelist?', description: 'Never accept what the token header says — enforce expected algorithm.' },
        ],
      },
    ],
    memoryTip: 'JWT payload is base64url — NOT encrypted. Anyone can decode and read it. Never put secrets in JWT payload.',
  },
  {
    id: 'sec-owasp-top10',
    topicId: 'sec-owasp',
    type: 'comparison',
    title: 'OWASP API Security Top 10 — Quick Reference',
    description: 'Most critical API risks with concrete mitigation patterns',
    columns: [
      {
        label: 'Top 5 Risks',
        nodes: [
          { id: 'a1', label: 'API1: BOLA / IDOR', description: 'Access other users\' resources by changing ID. Fix: ownership check in service layer.' },
          { id: 'a2', label: 'API2: Broken Auth', description: 'Weak tokens, no rate limit on auth. Fix: short JWTs, PKCE, MFA, rate limiting.' },
          { id: 'a3', label: 'API3: Mass Assignment', description: 'isAdmin=true accepted from request. Fix: DTOs, never bind request to entity.' },
          { id: 'a4', label: 'API4: No Rate Limiting', description: 'DoS via rapid requests. Fix: Redis rate counter per user per endpoint.' },
          { id: 'a5', label: 'API5: BFLA', description: 'Admin endpoint accessible by regular user. Fix: role check on every endpoint.' },
        ],
      },
      {
        label: 'Risks 6-10',
        nodes: [
          { id: 'a6', label: 'API6: Business Flow Abuse', description: 'Bot attacks on checkout, signup. Fix: CAPTCHA, device fingerprint, rate limit.' },
          { id: 'a7', label: 'API7: SSRF', description: 'User-supplied URL fetched by server. Fix: allowlist permitted domains.' },
          { id: 'a8', label: 'API8: Misconfiguration', description: 'Debug endpoints, verbose errors, default creds. Fix: secure defaults, pen test.' },
          { id: 'a9', label: 'API9: Inventory Mgmt', description: 'Undocumented shadow APIs bypass security. Fix: API gateway, inventory all endpoints.' },
          { id: 'a10', label: 'API10: Unsafe 3rd Party', description: 'Trusting 3rd party API data blindly. Fix: validate + sanitise all external data.' },
        ],
      },
    ],
    memoryTip: 'BOLA is #1 and easiest to exploit — always verify resource ownership even after authentication.',
  },
  {
    id: 'sec-secrets-flow',
    topicId: 'sec-secrets',
    type: 'flow',
    title: 'Vault Dynamic Secrets Flow',
    description: 'How an app gets DB credentials from Vault without static secrets',
    nodes: [
      { id: 'app', label: 'Application Pod', description: 'Vault Agent sidecar reads K8s ServiceAccount JWT.' },
      { id: 'auth', label: 'Vault K8s Auth', description: 'Vault validates JWT against K8s API. Returns Vault token for payment-service role.' },
      { id: 'policy', label: 'Vault Policy Check', description: 'payment-service policy: can read database/creds/payment-db-role only.' },
      { id: 'db', label: 'Vault DB Engine', description: 'Generates unique credential: username=v-k8s-pay-xHk92, password=..., TTL=1h' },
      { id: 'spring', label: 'Spring Boot', description: 'Receives credentials via Vault Agent. Configures HikariCP. Auto-renewed by agent.' },
    ],
    memoryTip: 'No static credentials anywhere — Vault generates unique, expiring credentials per app instance. Audit log tracks every read.',
  },
];
