import type { LearningTopic } from '../../../types';

export const reactTestingTopics: LearningTopic[] = [
  {
    id: 'react-testing-unit',
    technology: 'react',
    title: 'React Testing Library, Jest & Coverage',
    category: 'Testing',
    slug: 'react-testing-unit',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Test components the way users interact with them — find by role/text (not implementation), simulate clicks/typing, assert on visible output. Jest runs tests + collects coverage.',
    mentalModel:
      'React Testing Library = you are the USER. Don\'t test "state changed to X" — test "the button now says Approved." Query by role (getByRole) not by test-id (last resort).',
    memoryTip:
      'render(<Component/>) → screen.getByRole("button", {name: "Submit"}) → fireEvent.click() or userEvent.click() → expect(screen.getByText("Success")). Coverage: --coverage flag.',
    keyTerms: ['React Testing Library', 'Jest', 'Vitest', 'render', 'screen', 'getByRole', 'userEvent', 'waitFor', 'coverage', 'mocking', 'act()'],
    interviewAnswer: `**React Testing Library (RTL)** enforces testing from the user's perspective:

**Queries (priority order):**
1. getByRole("button", { name: "Submit" }) — accessible, preferred
2. getByLabelText("Email") — form inputs
3. getByText("Transfer successful") — visible text
4. getByTestId("submit-btn") — last resort when no accessible query works

**User events:** userEvent.click(), userEvent.type(), userEvent.selectOptions() — more realistic than fireEvent (handles focus, blur, key events).

**Async:** waitFor(() => expect(screen.getByText("Loaded")).toBeInTheDocument()) — waits for async rendering (API calls, transitions).

**Mocking:** jest.mock('./api') to mock API modules. MSW (Mock Service Worker) intercepts fetch/XHR at the network level — more realistic than module mocks.

**Coverage:** jest --coverage or vitest --coverage. Aim for: 80%+ line coverage, 90%+ on critical paths (payment flows). Istanbul/V8 for coverage reports. CI gate: fail if coverage drops below threshold.

**Jest vs Vitest:** Vitest is faster (native ESM, Vite-powered), jest-compatible API. Use Vitest for Vite projects, Jest for CRA/Webpack.`,
    codeExample: `import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferForm } from './TransferForm';

// Mock the API
const mockTransfer = vi.fn().mockResolvedValue({ success: true });
vi.mock('../api', () => ({ transferFunds: mockTransfer }));

describe('TransferForm', () => {
  it('submits transfer and shows success message', async () => {
    const user = userEvent.setup();
    render(<TransferForm />);

    // Fill form — query by accessible role/label
    await user.type(screen.getByLabelText('To Account'), '1234567890');
    await user.type(screen.getByLabelText('Amount'), '5000');
    await user.selectOptions(screen.getByLabelText('Currency'), 'USD');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Send Transfer' }));

    // Assert: API called with correct data
    expect(mockTransfer).toHaveBeenCalledWith({
      toAccount: '1234567890', amount: 5000, currency: 'USD',
    });

    // Assert: success message visible
    await waitFor(() => {
      expect(screen.getByText('Transfer successful')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid amount', async () => {
    const user = userEvent.setup();
    render(<TransferForm />);
    await user.type(screen.getByLabelText('Amount'), '-100');
    await user.click(screen.getByRole('button', { name: 'Send Transfer' }));
    expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
    expect(mockTransfer).not.toHaveBeenCalled();
  });
});`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Testing implementation (checking state values) instead of behavior (checking visible output).',
      'Using getByTestId when getByRole or getByLabelText works — breaks accessibility-first testing.',
      'Not awaiting async operations — tests pass but with act() warnings and flaky behavior.',
      'Mocking too much — mock the API layer, not internal hooks/state. MSW is better than jest.mock.',
      '100% coverage target — diminishing returns past 80%. Focus coverage on critical paths.',
    ],
    seniorInsight: 'In banking: test the CRITICAL USER JOURNEY — fill form, submit payment, see confirmation, check balance updated. Don\'t unit-test every utility function. Integration tests with MSW that test the full component + API interaction are worth 10 isolated unit tests.',
    aiAwareness: {
      strongAnswerShouldMention: ['query by role not test-id', 'userEvent over fireEvent', 'waitFor for async', 'MSW for API mocking', 'coverage thresholds in CI'],
      weakAnswer: 'I use React Testing Library to test components.',
      likelyFollowUp: ['Why userEvent over fireEvent?', 'How do you test components with API calls?', 'What coverage threshold do you target?'],
    },
    relatedTopics: ['react-testing-rtl', 'react-testing-e2e'],
    nextTopics: ['react-testing-e2e'],
    references: [
      { title: 'Testing Library — React', url: 'https://testing-library.com/docs/react-testing-library/intro', source: 'testing-library.com', type: 'official' },
    ],
  },

  {
    id: 'react-testing-e2e',
    technology: 'react',
    title: 'E2E Testing: Playwright, Cypress & TestCafe',
    category: 'Testing',
    slug: 'react-testing-e2e',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'E2E tests run in a real browser against the full application — testing the complete flow from login to payment to confirmation. Playwright is the modern choice; Cypress for simpler setups.',
    mentalModel:
      'Unit test = test one brick. Integration test = test a wall. E2E test = walk through the building as a customer — open door, press elevator, enter office.',
    memoryTip:
      'Playwright: multi-browser, parallel, auto-wait. Cypress: single-tab, interactive runner, time-travel debug. TestCafe: no WebDriver, concurrent browsers. Test pyramid: 70% unit, 20% integration, 10% E2E.',
    keyTerms: ['Playwright', 'Cypress', 'TestCafe', 'E2E', 'test pyramid', 'page object model', 'CI integration', 'visual regression', 'flaky tests'],
    interviewAnswer: `**Playwright** (recommended for banking):
- Multi-browser: Chromium, Firefox, WebKit in parallel.
- Auto-wait: waits for elements to be actionable before clicking (no explicit waits).
- Network interception: mock API responses or assert on API calls.
- Codegen: record user actions → generate test code.
- Parallel: runs tests across workers for speed.
- Tracing: records video, screenshots, and network on failure — attach to CI artifacts.

**Cypress**:
- Runs inside the browser (same event loop) — excellent for debugging.
- Time-travel debugger: step through each command, see DOM snapshots.
- Limitation: single-tab only (can't test multi-tab OAuth flows).
- Great for smaller apps and teams starting with E2E.

**TestCafe**:
- No WebDriver/browser plugins needed.
- Concurrent multi-browser testing.
- Built-in wait mechanism.
- Good for cross-browser matrix testing.

**Test pyramid for banking**: 70% unit/integration (RTL + MSW), 20% API/contract tests, 10% E2E (critical flows only: login → transfer → confirmation → logout). E2E tests are slow and flaky — only test the happy path and critical error paths.

**Page Object Model**: encapsulate page interactions in classes (LoginPage.login(user, pass), TransferPage.fillForm(data)) — DRY and maintainable.`,
    codeExample: `// Playwright E2E test — banking transfer flow
import { test, expect } from '@playwright/test';

test.describe('Payment Transfer', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@bank.com');
    await page.getByLabel('Password').fill('SecurePass123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('complete transfer flow', async ({ page }) => {
    // Navigate to transfers
    await page.getByRole('link', { name: 'Transfers' }).click();

    // Fill transfer form
    await page.getByLabel('To Account').fill('9876543210');
    await page.getByLabel('Amount').fill('1000');
    await page.getByLabel('Currency').selectOption('USD');
    await page.getByLabel('Reference').fill('Invoice #2024-001');

    // Submit
    await page.getByRole('button', { name: 'Review Transfer' }).click();

    // Review step — verify details
    await expect(page.getByText('USD 1,000.00')).toBeVisible();
    await expect(page.getByText('9876543210')).toBeVisible();

    // Confirm
    await page.getByRole('button', { name: 'Confirm Transfer' }).click();

    // Success
    await expect(page.getByText('Transfer successful')).toBeVisible();

    // Verify balance updated
    await page.getByRole('link', { name: 'Accounts' }).click();
    await expect(page.getByTestId('balance')).not.toHaveText('Loading');
  });

  test('shows error for insufficient funds', async ({ page }) => {
    // Mock API to return insufficient funds
    await page.route('**/api/transfers', (route) =>
      route.fulfill({ status: 400, json: { error: 'Insufficient funds' } })
    );

    await page.getByRole('link', { name: 'Transfers' }).click();
    await page.getByLabel('Amount').fill('999999999');
    await page.getByRole('button', { name: 'Review Transfer' }).click();
    await page.getByRole('button', { name: 'Confirm Transfer' }).click();

    await expect(page.getByText('Insufficient funds')).toBeVisible();
  });
});`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Too many E2E tests — they are slow and flaky. Test only critical user journeys.',
      'Hardcoded waits (sleep(3000)) instead of auto-wait or explicit assertions.',
      'Not mocking external services in E2E — tests fail when third-party APIs are down.',
      'No Page Object Model — duplicated selectors across 50 test files.',
      'Not running E2E in CI — tests only work on developer machines.',
    ],
    seniorInsight: 'In banking CI: run unit tests on every PR (fast gate). Run E2E tests nightly or on merge to main (slow gate). Use Playwright\'s tracing to debug failures without reproducing locally. Visual regression testing (Percy, Playwright screenshots) catches CSS regressions that unit tests miss.',
    aiAwareness: {
      strongAnswerShouldMention: ['Playwright multi-browser + auto-wait', 'test pyramid 70/20/10', 'Page Object Model', 'network interception', 'CI integration with tracing'],
      weakAnswer: 'E2E tests test the whole app in a browser.',
      likelyFollowUp: ['How do you handle flaky E2E tests?', 'Playwright vs Cypress — when to use which?', 'How do you integrate E2E in CI?'],
    },
    prerequisites: ['react-testing-unit'],
    relatedTopics: ['react-testing-rtl'],
    references: [
      { title: 'Playwright Documentation', url: 'https://playwright.dev/docs/intro', source: 'playwright.dev', type: 'official' },
    ],
  },

  {
    id: 'react-forms-advanced',
    technology: 'react',
    title: 'Advanced Forms: Autocomplete, Async Validation & Debounced Search',
    category: 'Testing',
    slug: 'react-forms-advanced',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Autocomplete with async API calls uses debounced input + TanStack Query for caching suggestions. Async validation checks server-side uniqueness. Debounced search prevents API spam.',
    mentalModel:
      'User types "John" → wait 300ms of silence (debounce) → fetch suggestions → show dropdown. Each keystroke does NOT trigger a fetch — only the final pause does.',
    memoryTip:
      'useDeferredValue for render debounce. lodash.debounce for API debounce. useQuery with the debounced value as query key. Controller for third-party autocomplete components.',
    keyTerms: ['debounce', 'useDeferredValue', 'async validation', 'autocomplete', 'Combobox', 'ARIA', 'AbortController', 'Controller'],
    interviewAnswer: `**Debounced search:**
User types → debounce 300ms → fetch only when user stops typing. Two approaches: (1) lodash.debounce wraps the setter (setSearchTerm), (2) useDeferredValue defers the value React uses for the expensive query (simpler, React-native). The query key includes the debounced value: useQuery({ queryKey: ['search', debouncedTerm], enabled: debouncedTerm.length >= 2 }).

**Async autocomplete:**
Combine debounced search with a dropdown. The input triggers a debounced API call, results populate a listbox (Combobox). ARIA: role="combobox", aria-expanded, aria-activedescendant for keyboard navigation. React Hook Form's Controller wraps third-party autocomplete components (Headless UI Combobox, MUI Autocomplete).

**Async validation:**
Validate on blur, not on every keystroke. Example: check if account number exists on the server. useQuery with enabled: !!fieldValue to trigger only when the field has a value. Show inline loading spinner during validation. React Hook Form: setError() for server-side errors, clearErrors() when resolved.

**AbortController:** Cancel the previous request when the user types more — prevents race conditions where an old slow request overwrites a newer fast one.`,
    codeExample: `// Debounced autocomplete with TanStack Query
function BeneficiarySearch() {
  const [input, setInput] = useState('');
  const debouncedTerm = useDeferredValue(input);  // React 18+ deferred value

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['beneficiaries', debouncedTerm],
    queryFn: ({ signal }) =>  // signal for auto-cancellation
      api.get('/beneficiaries/search', {
        params: { q: debouncedTerm },
        signal,  // cancel if query key changes before response
      }).then(r => r.data),
    enabled: debouncedTerm.length >= 2,  // don't search for 1 character
    staleTime: 60_000,  // cache results for 1 minute
  });

  return (
    <div role="combobox" aria-expanded={!!suggestions?.length}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        aria-autocomplete="list"
        placeholder="Search beneficiary..."
      />
      {isLoading && <Spinner size="sm" />}
      {suggestions?.map(b => (
        <div key={b.id} role="option" onClick={() => selectBeneficiary(b)}>
          {b.name} — {b.accountNumber}
        </div>
      ))}
    </div>
  );
}

// Async field validation — check account exists on blur
function useAccountValidation(accountNumber: string) {
  return useQuery({
    queryKey: ['validate-account', accountNumber],
    queryFn: () => api.get(\`/accounts/validate/\${accountNumber}\`).then(r => r.data),
    enabled: accountNumber.length >= 10,
    retry: false,
  });
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Fetching on every keystroke — API spam and race conditions. Always debounce.',
      'Not cancelling previous requests — old slow response overwrites newer data.',
      'Missing ARIA attributes on autocomplete — inaccessible to screen readers.',
      'Async validation on every keystroke — use onBlur mode, not onChange.',
      'Not caching autocomplete results — user searches same term twice, two API calls.',
    ],
    seniorInsight: 'In banking: beneficiary search, SWIFT/BIC lookup, IBAN validation — all async autocomplete patterns. The key is combining debounce + cancellation + caching. useDeferredValue is the simplest React approach; lodash.debounce gives more control over timing.',
    aiAwareness: {
      strongAnswerShouldMention: ['debounce 300ms', 'useDeferredValue', 'AbortController for cancellation', 'ARIA combobox', 'staleTime for caching', 'enabled flag'],
      weakAnswer: 'Use onChange to fetch data.',
      likelyFollowUp: ['How do you prevent race conditions in autocomplete?', 'useDeferredValue vs lodash.debounce?', 'How do you make autocomplete accessible?'],
    },
    prerequisites: ['react-hook-form', 'react-tanstack-query'],
    relatedTopics: ['react-debounce-throttle', 'react-forms'],
    references: [
      { title: 'ARIA Combobox Pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/', source: 'W3C', type: 'documentation' },
    ],
  },
];
