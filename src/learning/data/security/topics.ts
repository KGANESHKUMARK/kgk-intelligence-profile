import type { LearningTopic } from '../../types';

const T = 'security';

export const securityTopics: LearningTopic[] = [
  /* -------------------------------------------------------- OAuth 2.0 / OIDC */
  {
    id: 'sec-oauth-oidc',
    technology: T,
    title: 'OAuth 2.0 & OpenID Connect (OIDC)',
    category: 'Auth & Identity',
    slug: 'sec-oauth-oidc',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'OAuth 2.0 is an authorisation framework (access delegation); OIDC is an identity layer on top that adds authentication (who you are).',
    mentalModel: 'OAuth = "I authorise this app to read my Google Calendar." OIDC = "and here is a signed proof of who I am (ID token)." OAuth gives you an access token; OIDC gives you an ID token.',
    memoryTip: 'OAuth = access (what you can do). OIDC = identity (who you are). JWT ID token has sub, iss, aud, exp. Access token is opaque or JWT depending on provider.',
    keyTerms: ['OAuth 2.0', 'OIDC', 'authorization code flow', 'PKCE', 'access token', 'refresh token', 'ID token', 'scope', 'introspection', 'client credentials flow'],
    visualIds: ['sec-oauth-flow'],
    interviewAnswer: `OAuth 2.0 is an authorisation framework that lets a user delegate limited access to a third party without sharing credentials. The authorization code flow: (1) app redirects user to IdP with client_id + redirect_uri + scope + state; (2) user authenticates and consents; (3) IdP redirects back with code; (4) app exchanges code + client_secret for access_token + refresh_token. PKCE (Proof Key for Code Exchange) replaces client_secret for public clients (SPAs, mobile apps) — the app generates a code_verifier, sends code_challenge=SHA256(verifier) with the request, then proves it knows the verifier at token exchange. OIDC adds an ID token (JWT) containing claims: sub (user ID), iss (issuer), aud (client_id), exp (expiry), email, name. The access token is used to call APIs; the ID token is for the app to know who the user is — never send the ID token to APIs. Client credentials flow is for service-to-service (no user): service authenticates with client_id + client_secret and gets an access token with service-level scopes.`,
    detailedExplanation: `Token lifetimes: access tokens short-lived (5-15 min) to limit blast radius if stolen; refresh tokens long-lived (hours/days) stored server-side or in HttpOnly cookie. Spring Security Resource Server validates JWTs using the IdP's JWKS (JSON Web Key Set) endpoint — public keys fetched once and cached, signature verified locally on every request without a network call. Token introspection is the alternative for opaque tokens — the resource server calls the IdP's /introspect endpoint. In banking: use OIDC for customer-facing apps (Keycloak, Auth0, Okta), client credentials for internal microservice auth.`,
    codeExample: `# Spring Boot Resource Server — JWT validation
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: https://idp.bank.com/realms/banking/.well-known/jwks.json

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter())))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasAuthority("SCOPE_admin")
                .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    JwtAuthenticationConverter jwtConverter() {
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Map "roles" claim from Keycloak to Spring authorities
            List<String> roles = jwt.getClaimAsStringList("realm_access.roles");
            return (roles == null ? List.of() : roles).stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toList());
        });
        return converter;
    }
}`,
    practicalExample: `Julius Baer internal APIs use client credentials flow: each microservice has a Keycloak client with scopes matching the APIs it can call. The payment service has scope=payment:write; the audit service has scope=audit:read. A token with payment:write cannot access audit endpoints — enforced at the API gateway before requests reach individual services.`,
    commonMistakes: [
      'Sending the ID token to APIs — it is for the client app to identify the user, not for API authentication.',
      'Using implicit flow — deprecated, tokens in URL fragment are logged. Use authorization code + PKCE.',
      'Long-lived access tokens — short access tokens limit the window if a token is stolen.',
      'Storing refresh tokens in localStorage — XSS can steal them. Use HttpOnly cookies.',
    ],
    seniorInsight: `Token rotation for refresh tokens: on each use, the IdP issues a new refresh token and invalidates the old one. If an attacker steals and uses a refresh token, the next legitimate use fails — alerting the user and revoking the attacker\'s session. This is the refresh token rotation pattern and is a security requirement in OpenID Connect Security Best Practices.`,
    aiAwareness: {
      strongAnswerShouldMention: ['authorization code + PKCE', 'access token vs ID token', 'client credentials for services', 'short-lived access tokens', 'JWKS validation'],
      weakAnswer: 'OAuth is for login with Google, it gives you a token to call APIs.',
      redFlags: ['Sending ID token to APIs', 'Using implicit flow', 'Storing refresh tokens in localStorage'],
      likelyFollowUp: ['What is PKCE and why is it needed?', 'How does Spring Security validate JWTs?', 'What is the difference between access token and ID token?'],
    },
    prerequisites: [],
    relatedTopics: ['sec-jwt', 'sec-zero-trust'],
    nextTopics: ['sec-jwt'],
    interviewQuestions: ['q-sec-oauth-flow', 'q-sec-pkce'],
  },
  /* ------------------------------------------------------------------ JWT */
  {
    id: 'sec-jwt',
    technology: T,
    title: 'JWT Internals — Signing, Validation & Attack Vectors',
    category: 'Auth & Identity',
    slug: 'sec-jwt',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'A JWT is a signed, base64-encoded JSON claim set. The signature proves the claim set was not tampered with, but the payload is readable by anyone with the token.',
    mentalModel: 'JWT = header.payload.signature. Anyone can base64-decode the payload and read the claims. Only the secret-holder can verify the signature. "Signed" ≠ "encrypted".',
    memoryTip: 'JWT = 3 dots. Header (alg), Payload (claims), Signature. RS256 = asymmetric (IdP signs with private key, any service verifies with public key). HS256 = shared secret.',
    keyTerms: ['JWT', 'JWS', 'JWE', 'RS256', 'HS256', 'JWKS', 'alg:none attack', 'key confusion attack', 'exp claim', 'token revocation'],
    visualIds: ['sec-jwt-anatomy'],
    interviewAnswer: `A JWT has three parts separated by dots: header (algorithm + type), payload (claims), signature. The payload is only base64-encoded — not encrypted — so never put secrets in a JWT payload. RS256 (RSA + SHA-256): the IdP signs with its private key; resource servers verify with the IdP's public key (fetched from the JWKS endpoint). HS256: a shared secret signs and verifies — all parties must know the secret. Prefer RS256 for public APIs (no secret distribution). Attack vectors: (1) alg:none attack — attacker strips the signature and sets alg=none; validate that your library never accepts alg=none. (2) RS256-to-HS256 confusion — attacker tricks a server configured for RS256 to accept a token signed with HS256 using the public key as the HMAC secret; always explicitly whitelist the expected algorithm. (3) expired tokens — always check exp claim. (4) wrong audience — always check aud claim matches your service's client_id.`,
    internalWorking: `JWT validation sequence in Spring Security: (1) extract token from Authorization: Bearer header; (2) parse header to get alg; (3) fetch public key from JWKS endpoint (or cache); (4) verify signature using the public key; (5) decode payload; (6) validate: exp > now, iss is the expected IdP, aud contains this service's client_id, nbf <= now. All 6 must pass. Failure = 401. Revocation: JWTs are stateless — you cannot revoke them without a blocklist or waiting for expiry. Short access token lifetime (5 min) is the pragmatic solution.`,
    codeExample: `// Spring Security JWT — validate, extract custom claims
@Component
public class JwtClaimsExtractor {
    
    public PaymentClaims extract(JwtAuthenticationToken token) {
        Jwt jwt = token.getToken();
        
        // Always validate audience explicitly
        List<String> audience = jwt.getAudience();
        if (!audience.contains("payment-service")) {
            throw new JwtValidationException("Token not intended for payment-service", 
                Collections.singleton(JwtValidationError.invalidAudience()));
        }
        
        return PaymentClaims.builder()
            .userId(jwt.getSubject())                             // sub claim
            .roles(jwt.getClaimAsStringList("realm_access.roles"))
            .tenantId(jwt.getClaimAsString("tenant_id"))         // custom claim
            .scopes(jwt.getClaimAsStringList("scope"))
            .expiresAt(jwt.getExpiresAt())
            .build();
    }
}

// JWT blocklist for critical token revocation (logout, password change)
@Service
public class TokenBlocklist {
    private final RedisTemplate<String, String> redis;
    
    public void revoke(String jti, Instant expiry) {
        Duration ttl = Duration.between(Instant.now(), expiry);
        redis.opsForValue().set("blocklist:" + jti, "revoked", ttl);
    }
    
    public boolean isRevoked(String jti) {
        return Boolean.TRUE.equals(redis.hasKey("blocklist:" + jti));
    }
}`,
    practicalExample: `In the portfolio RAG chatbot, API requests carry a JWT from Google/Groq. The chatbot backend validates the signature against the provider's JWKS, checks exp and aud, and extracts the user sub for rate limiting — all in < 1ms locally without a network call to the IdP.`,
    commonMistakes: [
      'Accepting alg:none — the most famous JWT vulnerability; always whitelist expected algorithms.',
      'Putting sensitive data in JWT payload — it is only base64-encoded, any holder can read it.',
      'Never checking the aud claim — a token issued for service A can be replayed against service B.',
      'Long-lived access tokens as a substitute for refresh token logic.',
    ],
    seniorInsight: `For critical operations (password change, wire transfer), maintain a JWT blocklist in Redis keyed by jti (JWT ID) with TTL = token expiry. This adds a Redis read on every request — acceptable for high-security paths but not every API. Use short tokens + refresh rotation for standard paths; only blocklist for logout and security events.`,
    aiAwareness: {
      strongAnswerShouldMention: ['alg:none attack', 'RS256 vs HS256', 'exp/aud/iss validation', 'payload is not encrypted', 'JWKS', 'token revocation trade-off'],
      weakAnswer: 'JWT is a token used for authentication. It has a header, payload and signature.',
      redFlags: ['Thinks JWT is encrypted', 'Does not know alg:none', 'Never validates audience'],
      likelyFollowUp: ['What is the alg:none attack?', 'How do you revoke a JWT?', 'When would you use RS256 vs HS256?'],
    },
    prerequisites: ['sec-oauth-oidc'],
    relatedTopics: ['sec-owasp', 'sec-zero-trust'],
    nextTopics: ['sec-owasp'],
    interviewQuestions: ['q-sec-jwt-attacks', 'q-sec-jwt-revocation'],
  },
  /* --------------------------------------------------------- OWASP Top 10 */
  {
    id: 'sec-owasp',
    technology: T,
    title: 'OWASP API Security Top 10',
    category: 'API Security',
    slug: 'sec-owasp',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'The 10 most critical API security risks with concrete mitigations — the foundation of any secure API design.',
    mentalModel: 'APIs are the attack surface. OWASP catalogues the patterns attackers exploit most. Know the name, the attack scenario, and the concrete code fix.',
    memoryTip: 'Top 3 most critical: BOLA (Broken Object Level Authorisation), Broken Auth, Excessive Data Exposure. BOLA = accessing other users\' objects via their ID.',
    keyTerms: ['BOLA', 'BFLA', 'BOPLA', 'mass assignment', 'injection', 'rate limiting', 'SSRF', 'security misconfiguration', 'insufficient logging'],
    visualIds: ['sec-owasp-top10'],
    interviewAnswer: `API1 - BOLA (Broken Object Level Authorisation, aka IDOR): API accepts user-controlled ID but doesn't verify the resource belongs to the requesting user. Fix: always check resource ownership in the service layer, not just authentication. API2 - Broken Authentication: missing token validation, weak JWT algorithms, no rate limiting on auth endpoints. API3 - BOPLA (Broken Object Property Level Authorisation, aka mass assignment): API accepts all fields from request body including admin-only fields (isAdmin=true). Fix: use DTOs with explicit field mapping, never bind request body directly to entities. API4 - Unrestricted Resource Consumption: no rate limiting or size limits — DoS via large payloads or rapid requests. API5 - BFLA (Broken Function Level Authorisation): endpoint accessible without the required role. API6 - Unrestricted Access to Sensitive Business Flows: bot attacks on checkout/login flows. Fix: rate limiting, CAPTCHA, device fingerprinting. API7 - SSRF: API fetches a URL from user input, attacker supplies cloud metadata endpoint (169.254.169.254). Fix: allowlist of permitted domains. API8 - Security Misconfiguration: debug endpoints in prod, verbose error messages, default credentials. API9 - Improper Inventory Management: undocumented shadow APIs bypass security controls. API10 - Unsafe Consumption of APIs: blindly trusting data from third-party APIs.`,
    codeExample: `// BOLA fix: verify resource ownership before access
@GetMapping("/accounts/{accountId}/transactions")
public List<Transaction> getTransactions(@PathVariable String accountId,
                                          @AuthenticationPrincipal UserDetails user) {
    // INSECURE: just fetches by accountId — any authenticated user can access any account
    // return transactionRepo.findByAccountId(accountId);
    
    // SECURE: verify the account belongs to the authenticated user
    Account account = accountRepo.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    if (!account.getOwnerId().equals(user.getUsername())) {
        throw new AccessDeniedException("Not your account");  // 403, not 404 leaking existence
    }
    return transactionRepo.findByAccountId(accountId);
}

// Mass assignment / BOPLA fix: use explicit DTOs
public record CreateUserRequest(
    String email,          // ✓ allowed from client
    String displayName     // ✓ allowed from client
    // isAdmin, role, createdAt — NOT here, populated server-side
) {}

// SSRF fix: URL allowlist
@Value("\${allowed.domains}")
private Set<String> allowedDomains;

public byte[] fetchUserAvatar(String url) {
    URI uri = URI.create(url);
    if (!allowedDomains.contains(uri.getHost())) {
        throw new SecurityException("Domain not in allowlist: " + uri.getHost());
    }
    return httpClient.get(url);
}`,
    practicalExample: `In a banking API review, I found a BOLA vulnerability: GET /api/statements/{statementId} — the statementId was a sequential integer. An authenticated user could enumerate integers and access other users' statements. Fix: (1) use UUIDs for all external IDs (non-guessable), (2) add ownership check in the service layer, (3) add integration test that explicitly verifies user A cannot access user B's statement.`,
    commonMistakes: [
      'Relying on obscurity (UUIDs) instead of authorisation — UUIDs reduce guessability but don\'t replace ownership checks.',
      'Returning 404 for unauthorised access — reveals resource existence to attackers; use 403.',
      'Binding request body directly to JPA entity — mass assignment vulnerability.',
      'No rate limiting on auth endpoints — brute-force and credential stuffing attacks.',
    ],
    seniorInsight: `The most impactful security review technique: threat modelling with STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege). Run a 2-hour session for each new feature: one engineer proposes attacks per STRIDE category, another proposes mitigations. This is cheaper than finding the same vulnerabilities in a penetration test after deployment.`,
    aiAwareness: {
      strongAnswerShouldMention: ['BOLA/IDOR', 'mass assignment', 'SSRF', 'rate limiting', 'ownership check in service layer'],
      weakAnswer: 'We use HTTPS and validate inputs to prevent injection attacks.',
      redFlags: ['Only knows SQL injection from OWASP', 'Doesn\'t know BOLA'],
      likelyFollowUp: ['How do you prevent BOLA in a REST API?', 'What is mass assignment and how do you fix it?', 'How do you prevent SSRF?'],
    },
    prerequisites: ['sec-jwt'],
    relatedTopics: ['sec-secrets', 'sec-zero-trust'],
    nextTopics: ['sec-secrets'],
    interviewQuestions: ['q-sec-bola', 'q-sec-owasp-api'],
  },
  /* ------------------------------------------------- Secrets Management */
  {
    id: 'sec-secrets',
    technology: T,
    title: 'Secrets Management — Vault, KMS & Zero Secrets in Code',
    category: 'Secrets & Cryptography',
    slug: 'sec-secrets',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Secrets (credentials, keys, certs) must never appear in code, config files, or environment variables — use a secrets manager with audit, rotation, and least-privilege access.',
    mentalModel: 'Think of secrets like physical keys: you don\'t embed a house key in the door frame. Vault/KMS is the key safe. Apps check out what they need, for as long as they need it, with a logged audit trail.',
    memoryTip: 'Never in code (git history). Never in env vars (process list). Never in config files committed to git. Use: Vault dynamic secrets, AWS Secrets Manager, or K8s External Secrets Operator.',
    keyTerms: ['HashiCorp Vault', 'dynamic secrets', 'AWS Secrets Manager', 'KMS', 'secret rotation', 'External Secrets Operator', 'Sealed Secrets', 'encryption at rest', 'envelope encryption'],
    visualIds: ['sec-secrets-flow'],
    interviewAnswer: `Secrets management principles: (1) Zero secrets in code or git — scanners like truffleHog or GitGuardian catch commits with credentials. (2) Dynamic secrets over static — Vault generates a unique, short-lived DB credential for each app instance; if the credential leaks it's already expired. (3) Secret rotation without deployment — change the secret in Vault/Secrets Manager; apps refresh on next read. (4) Audit every access — Vault logs every secret read with the accessor's identity. (5) Least privilege — the payment service can only read its own DB credentials, not the fraud service's API key. In Kubernetes: External Secrets Operator syncs secrets from Vault/AWS Secrets Manager to K8s Secrets at deploy time; Sealed Secrets encrypts K8s Secret manifests so they can be safely committed to git (decrypted only by the cluster's controller).`,
    internalWorking: `AWS KMS envelope encryption: data is encrypted with a data key (DEK), the DEK is encrypted with a KMS Customer Master Key (CMK) stored in HSM. The encrypted DEK is stored with the data. To decrypt: call KMS to decrypt the DEK (audited), use the plaintext DEK to decrypt data locally. KMS never touches the plaintext data — the DEK lives in memory briefly. Spring Cloud Vault: fetches secrets from Vault at startup using the app's Vault AppRole credentials; secrets are injected as Spring properties.`,
    codeExample: `// Spring Cloud Vault — secrets from Vault as Spring properties
# bootstrap.yaml (or Spring Cloud Config)
spring:
  cloud:
    vault:
      uri: https://vault.banking.internal:8200
      authentication: KUBERNETES          # pod's service account JWT
      kubernetes:
        role: payment-service
      kv:
        enabled: true
        backend: secret
        default-context: payment-service  # reads secret/payment-service/...

# Vault policy for payment-service (least privilege)
path "secret/data/payment-service/*" {
  capabilities = ["read"]               # read only
}
path "database/creds/payment-db-role" {
  capabilities = ["read"]               # dynamic DB credentials
}

# Vault dynamic secret — unique per-app credentials, auto-rotated
$ vault read database/creds/payment-db-role
Key                Value
username           v-k8s-payment-xHk92
password           A1b2C3d4-expires-in-1h
lease_duration     1h                    # Vault renews automatically`,
    practicalExample: `A leaked GitHub token caused a major incident: a developer accidentally committed an AWS access key to a public repo. With Vault dynamic secrets: even if the same commit happened, the leaked credential would have expired in 1 hour and been usable by only one app instance. The audit log would show exactly which Vault token was used and when.`,
    commonMistakes: [
      'Environment variables for secrets — they appear in process listings, crash reports, and are inherited by child processes.',
      'Hardcoded secrets in application.properties committed to git — git history is permanent.',
      'Shared static DB credentials across services — if one service is compromised, all DB access is exposed.',
      'No secret rotation — static credentials accumulate exposure risk over their lifetime.',
    ],
    seniorInsight: `Add truffleHog (or GitLeaks) as a pre-commit hook and in CI — it scans every commit for credential patterns (AWS keys, private keys, generic high-entropy strings). Combined with GitHub secret scanning, this catches accidental commits before they reach the remote. In a regulated bank, this is not optional — it is a PCI-DSS requirement.`,
    aiAwareness: {
      strongAnswerShouldMention: ['dynamic secrets', 'Vault', 'External Secrets Operator', 'never in code/git', 'secret rotation', 'audit trail'],
      weakAnswer: 'We use environment variables for secrets and rotate them occasionally.',
      redFlags: ['Secrets in application.properties', 'Shared static DB credentials', 'No rotation plan'],
      likelyFollowUp: ['What are Vault dynamic secrets?', 'How does External Secrets Operator work?', 'How do you handle secret rotation without downtime?'],
    },
    prerequisites: [],
    relatedTopics: ['sec-zero-trust', 'sec-owasp'],
    nextTopics: ['sec-zero-trust'],
    interviewQuestions: ['q-sec-secrets-rotation', 'q-sec-vault'],
  },
  /* -------------------------------------------------------- Zero Trust */
  {
    id: 'sec-zero-trust',
    technology: T,
    title: 'Zero Trust Architecture & mTLS',
    category: 'Network Security',
    slug: 'sec-zero-trust',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Zero trust means "never trust, always verify" — authenticate and authorise every request regardless of network location, including internal service-to-service calls.',
    mentalModel: 'Perimeter security = trust everything inside the firewall. Zero trust = trust nobody, verify everything. A compromised internal service doesn\'t automatically have access to other services.',
    memoryTip: 'Zero trust = verify identity (mTLS certs), verify authorisation (JWT scopes), minimise blast radius (least privilege), log everything (audit trail). Istio service mesh enforces all four.',
    keyTerms: ['zero trust', 'mTLS', 'service mesh', 'Istio', 'SPIFFE/SPIRE', 'workload identity', 'network segmentation', 'micro-segmentation', 'PeerAuthentication'],
    visualIds: [],
    interviewAnswer: `Zero trust replaces the perimeter model: instead of trusting all traffic inside the corporate network, every request is authenticated and authorised regardless of where it originates. In Kubernetes microservices: mTLS (mutual TLS) authenticates both sides of every service-to-service call using short-lived X.509 certificates. Istio service mesh injects Envoy sidecars that handle mTLS transparently — no application code changes. SPIFFE (Secure Production Identity Framework for Everyone) defines the workload identity standard: each pod gets a SPIFFE Verifiable Identity Document (SVID) — an X.509 cert with a URI SAN like spiffe://cluster.local/ns/banking/sa/payment-service. AuthorizationPolicy in Istio: payment-service can only call fraud-service on port 8080; any other call is denied by default. This prevents lateral movement — a compromised payment service cannot call the HR database.`,
    codeExample: `# Istio PeerAuthentication — enforce mTLS for all services in namespace
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: banking
spec:
  mtls:
    mode: STRICT    # reject non-mTLS connections

# Istio AuthorizationPolicy — payment-service can only call fraud-service
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: fraud-service-authz
  namespace: banking
spec:
  selector:
    matchLabels:
      app: fraud-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/banking/sa/payment-service"]
    to:
    - operation:
        methods: ["POST"]
        paths: ["/api/fraud/check"]

# Spring Security — defence in depth (application-level check)
@PreAuthorize("hasAuthority('SCOPE_fraud:check')")
@PostMapping("/api/fraud/check")
public FraudResult checkFraud(@RequestBody FraudRequest req) { ... }`,
    practicalExample: `Before zero trust at Julius Baer: if a service inside the VPC was compromised, the attacker could call any other internal service. After implementing Istio mTLS + AuthorizationPolicy: the payment service can only call the services it is explicitly authorised to call. An attacker who compromises payment cannot reach the customer PII service or the HR service — lateral movement is prevented by policy.`,
    commonMistakes: [
      'Trusting traffic because it comes from inside the VPC — lateral movement starts from a compromised internal service.',
      'Using Istio in PERMISSIVE mode in production — this allows non-mTLS traffic (the default; must explicitly set STRICT).',
      'No application-level authorisation — relying only on network policies without application-level JWT validation.',
      'Long-lived X.509 certificates — SPIRE rotates certs every hour; manual cert management uses year-long certs that accumulate risk.',
    ],
    seniorInsight: `Zero trust is an organisational posture, not a product. The technology (Istio, SPIFFE, JWKS) is the easy part. The hard part: (1) inventory every service-to-service call and codify it in AuthorizationPolicy, (2) instrument everything so you can detect violations, (3) convince teams that "internal = trusted" is a security anti-pattern. I\'ve seen SOC auditors reject entire architectures because they had no service-to-service authentication — in banking this is a regulatory requirement.`,
    aiAwareness: {
      strongAnswerShouldMention: ['never trust always verify', 'mTLS', 'service mesh', 'workload identity', 'AuthorizationPolicy', 'lateral movement prevention'],
      weakAnswer: 'Zero trust means not trusting users even if they are inside the network.',
      redFlags: ['Thinks VPN = zero trust', 'No service-to-service auth', 'Permissive mTLS mode'],
      likelyFollowUp: ['How does mTLS work?', 'What is SPIFFE?', 'How does Istio enforce zero trust?'],
    },
    prerequisites: ['sec-oauth-oidc', 'sec-jwt'],
    relatedTopics: ['sec-secrets'],
    nextTopics: [],
    interviewQuestions: ['q-sec-zero-trust', 'q-sec-mtls'],
  },
];
