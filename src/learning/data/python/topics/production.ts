import type { LearningTopic } from '../../../types';

const T = 'python';

export const pythonProductionTopics: LearningTopic[] = [
  {
    id: 'python-rest-apis',
    technology: T,
    title: 'Building REST APIs with FastAPI',
    category: 'Production Engineering',
    slug: 'python-rest-apis',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'FastAPI gives automatic validation, serialization, OpenAPI docs, and async support using Pydantic models and type hints.',
    mentalModel:
      'REST API = HTTP methods map to resource operations. FastAPI validates requests/responses via Pydantic and generates docs automatically.',
    memoryTip:
      'FastAPI + Pydantic + uvicorn. Define request/response models. @app.get("/items/{id}"). Use Depends for DI. TestClient for tests.',
    keyTerms: ['FastAPI', 'Pydantic', 'uvicorn', 'ASGI', 'REST', 'CRUD', 'dependency injection', 'OpenAPI', 'TestClient'],
    interviewAnswer: `FastAPI is a modern Python web framework built on Starlette and Pydantic. It uses Python type hints to validate and serialize request/response data automatically, generating OpenAPI/Swagger docs without extra code.

Key features:
- Automatic request validation and 422 responses via Pydantic models.
- Async support out of the box (ASGI + uvicorn).
- Dependency injection with Depends() for shared logic like auth or DB sessions.
- BackgroundTasks for fire-and-forget work after responding.
- TestClient for full HTTP testing without running a server.

REST conventions use nouns and HTTP verbs: GET /accounts, POST /accounts, GET /accounts/{id}, PUT/PATCH /accounts/{id}, DELETE /accounts/{id}.`,
    codeExample: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class AccountCreate(BaseModel):
    owner: str = Field(..., min_length=1)
    currency: str = Field(..., pattern='^[A-Z]{3}$')
    initial_balance: float = Field(..., gt=0)

class AccountResponse(BaseModel):
    id: str
    owner: str
    currency: str
    balance: float

ACCOUNTS: dict[str, AccountResponse] = {}

@app.post('/accounts', response_model=AccountResponse, status_code=201)
def create_account(payload: AccountCreate):
    account_id = f'ACC-{len(ACCOUNTS) + 1:06d}'
    account = AccountResponse(
        id=account_id, owner=payload.owner,
        currency=payload.currency, balance=payload.initial_balance,
    )
    ACCOUNTS[account_id] = account
    return account

@app.get('/accounts/{account_id}', response_model=AccountResponse)
def get_account(account_id: str):
    if account_id not in ACCOUNTS:
        raise HTTPException(status_code=404, detail='Account not found')
    return ACCOUNTS[account_id]`,
    codeLanguage: 'python',
    commonMistakes: [
      'Putting business logic inside route handlers — use services.',
      'Manual validation instead of Pydantic schemas.',
      'Using sync DB drivers in async endpoints without run_in_threadpool.',
      'Returning plain dicts instead of response models.',
    ],
    seniorInsight: 'In banking, Pydantic is your API contract. It validates account numbers, currencies, positive amounts, and enums before business logic runs. Combine FastAPI with dependency injection for auth, audit logging, and transaction scoping.',
    aiAwareness: {
      strongAnswerShouldMention: ['Pydantic auto-validation', 'OpenAPI docs', 'dependency injection', 'async/ASGI', 'TestClient'],
      weakAnswer: 'FastAPI is a Python web framework.',
      likelyFollowUp: ['FastAPI vs Flask', 'How does Depends() work?', 'Async SQLAlchemy with FastAPI'],
    },
    prerequisites: ['python-oop', 'python-exceptions'],
    relatedTopics: ['python-testing', 'python-clean-code'],
    references: [
      { title: 'FastAPI Documentation', url: 'https://fastapi.tiangolo.com/', source: 'fastapi.tiangolo.com', type: 'official' },
    ],
  },

  {
    id: 'python-testing',
    technology: T,
    title: 'Testing with pytest',
    category: 'Production Engineering',
    slug: 'python-testing',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'pytest is the standard Python testing framework: plain assert, fixtures for setup, parametrize for data-driven tests, and unittest.mock for boundaries.',
    mentalModel:
      'A test calls code and asserts the result. A fixture prepares the environment. A mock replaces an external dependency.',
    memoryTip:
      'pytest uses plain assert. @pytest.fixture. monkeypatch for mocks. @pytest.mark.parametrize. conftest.py for shared fixtures.',
    keyTerms: ['pytest', 'fixture', 'parametrize', 'mock', 'monkeypatch', 'coverage', 'TestClient', 'conftest.py'],
    interviewAnswer: `pytest test functions start with test_ and use plain assert statements. pytest rewrites asserts to provide detailed failure messages.

Fixtures create reusable setup: test clients, database sessions, sample data. Use scope="session" for once-per-run setup, scope="function" for fresh setup each test. conftest.py collects shared fixtures.

Parametrize runs the same test with multiple inputs, perfect for boundary value testing.

Mock boundaries (external APIs, database, file system) with unittest.mock.patch or monkeypatch. Do not mock internal implementation details.

Coverage is measured with pytest-cov. Aim for 80%+ overall and near 100% on critical paths like payment processing.`,
    codeExample: `import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from myapp.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_create_account(client):
    response = client.post('/accounts', json={
        'owner': 'Alice', 'currency': 'USD', 'initial_balance': 1000.0,
    })
    assert response.status_code == 201
    assert response.json()['owner'] == 'Alice'

@pytest.mark.parametrize('amount,expected_status', [
    (100.0, 201),
    (-10.0, 422),
    (0.0, 422),
])
def test_balance_validation(client, amount, expected_status):
    response = client.post('/accounts', json={
        'owner': 'Bob', 'currency': 'USD', 'initial_balance': amount,
    })
    assert response.status_code == expected_status

@patch('myapp.payments.fetch_exchange_rate')
def test_convert_currency(mock_fetch):
    mock_fetch.return_value = 1.25
    assert convert_currency(100, 'USD', 'EUR') == 125.0`,
    codeLanguage: 'python',
    commonMistakes: [
      'Testing internal implementation instead of behavior.',
      'Not mocking external services — flaky, slow tests.',
      'Using real databases in unit tests.',
      'Over-mocking internal functions.',
    ],
    seniorInsight: 'Banking code must be testable at the service layer. Use dependency injection and repository pattern so tests can swap in fakes. FastAPI TestClient tests the full HTTP layer without a running server.',
    aiAwareness: {
      strongAnswerShouldMention: ['plain assert', 'fixtures', 'parametrize', 'mock.patch', 'coverage', 'TestClient'],
      weakAnswer: 'pytest is for writing tests in Python.',
      likelyFollowUp: ['pytest vs unittest', 'When to use monkeypatch?', 'How to test FastAPI endpoints?'],
    },
    prerequisites: ['python-exceptions'],
    relatedTopics: ['python-rest-apis', 'python-clean-code'],
    references: [
      { title: 'pytest Documentation', url: 'https://docs.pytest.org/', source: 'pytest.org', type: 'official' },
    ],
  },

  {
    id: 'python-error-handling',
    technology: T,
    title: 'Production Error Handling & Logging',
    category: 'Production Engineering',
    slug: 'python-error-handling',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Production services need structured logging, retries with backoff, circuit breakers, and centralized error tracking — not just try/except.',
    mentalModel:
      'Errors will happen. Log them, retry transient failures, break circuits for cascading failures, and degrade gracefully where safe.',
    memoryTip:
      'JSON structured logs. tenacity for retry. sentry-sdk for errors. Circuit breaker for downstream. Graceful degradation for non-critical paths.',
    keyTerms: ['structured logging', 'retry', 'backoff', 'circuit breaker', 'Sentry', 'graceful degradation', 'tenacity'],
    interviewAnswer: `Structured logging outputs JSON with request_id, user_id, timestamp, and service name so logs can be searched and correlated across microservices. Avoid plain print().

Retry transient failures with exponential backoff and jitter. Do not retry 4xx client errors. Use libraries like tenacity or implement your own decorator.

Circuit breaker stops calling a failing downstream service after repeated failures, preventing cascading outages. After a cooldown, it allows a probe request.

Sentry captures unhandled exceptions with stack traces and context. Every production Python service should have it.

Graceful degradation returns cached or default data for non-critical features when a dependency is down. Critical paths like payment authorization must fail fast instead.`,
    codeExample: `import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
def call_payment_gateway(payload: dict):
    response = requests.post(PAYMENT_URL, json=payload, timeout=5)
    response.raise_for_status()
    return response.json()

class CircuitBreaker:
    def __init__(self, threshold=5, timeout=30):
        self.threshold = threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure = 0
        self.state = 'CLOSED'

    def call(self, func, *args, **kwargs):
        if self.state == 'OPEN':
            if time.time() - self.last_failure > self.timeout:
                self.state = 'HALF_OPEN'
            else:
                raise ServiceUnavailable('Circuit OPEN')
        try:
            result = func(*args, **kwargs)
            self.failures = 0
            self.state = 'CLOSED'
            return result
        except Exception:
            self.failures += 1
            self.last_failure = time.time()
            if self.failures >= self.threshold:
                self.state = 'OPEN'
            raise`,
    codeLanguage: 'python',
    commonMistakes: [
      'Using print() instead of structured logging.',
      'Retrying all errors including 4xx.',
      'No circuit breaker — cascading failures.',
      'Missing request_id in logs.',
    ],
    seniorInsight: 'Banking services must be observable. Every payment failure needs full context logged with correlation IDs. Circuit breakers protect customer-facing APIs from third-party provider outages.',
    aiAwareness: {
      strongAnswerShouldMention: ['structured JSON logging', 'exponential backoff', 'circuit breaker', 'Sentry', 'graceful degradation'],
      weakAnswer: 'Use try/except and print errors.',
      likelyFollowUp: ['When not to retry?', 'Implement circuit breaker', 'Trace requests across services'],
    },
    prerequisites: ['python-exceptions'],
    relatedTopics: ['python-rest-apis', 'python-testing'],
    references: [
      { title: 'Python logging', url: 'https://docs.python.org/3/library/logging.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-clean-code',
    technology: T,
    title: 'Clean, Maintainable Python Code',
    category: 'Production Engineering',
    slug: 'python-clean-code',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Clean code is readable, testable, and focused: type hints, small functions, clear naming, and separation of concerns.',
    mentalModel:
      'Code is read more than written. A function does one thing and its name explains it. A module has one reason to change.',
    memoryTip:
      'PEP 8. Type hints. Small functions. Descriptive names. Single Responsibility. black/ruff/mypy in CI. Repository pattern.',
    keyTerms: ['PEP 8', 'type hints', 'SOLID', 'DRY', 'repository pattern', 'mypy', 'ruff', 'black'],
    interviewAnswer: `Follow PEP 8 for formatting and naming. Use type hints everywhere; they act as documentation and enable mypy to catch bugs at build time.

Keep functions small and focused. If the function name contains "and", split it. A function should do one thing.

Separate concerns: routes handle HTTP, services contain business logic, repositories access data, and models represent domain entities. This makes code testable and replaceable.

Use dependency injection instead of hard-coding dependencies. This lets tests swap in fakes.

Run black, ruff, and mypy in CI via pre-commit or pipeline checks. Code quality gates prevent entire categories of bugs.`,
    codeExample: `# BAD: mixed concerns, untyped
def do_stuff(data):
    if data['amount'] <= 0:
        return None
    conn = sqlite3.connect('db.sqlite')
    conn.execute('INSERT INTO payments ...')
    send_email(data['email'], 'Done')
    return True

# GOOD: separated, typed
def create_payment(payload: PaymentCreate, service: PaymentService = Depends(get_payment_service)):
    service.process(PayloadAdapter.to_domain(payload))

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

class PaymentService:
    def __init__(self, repo: PaymentRepository, notifier):
        self.repo = repo
        self.notifier = notifier

    def process(self, payment: Payment) -> None:
        if payment.amount <= 0:
            raise ValueError('Amount must be positive')
        self.repo.save(payment)
        self.notifier.send_receipt(payment.email, payment.amount)`,
    codeLanguage: 'python',
    commonMistakes: [
      'Giant functions validating, processing, saving, and notifying.',
      'No type hints.',
      'Tight coupling to concrete implementations.',
      'Skipping linting/type checks in CI.',
    ],
    seniorInsight: 'Banking code lives for years and is audited. Clean architecture matters more than clever one-liners. A reviewer should understand a function from its name and type signature. mypy and ruff in CI prevent whole categories of bugs.',
    aiAwareness: {
      strongAnswerShouldMention: ['PEP 8', 'type hints', 'separation of concerns', 'repository pattern', 'black/ruff/mypy'],
      weakAnswer: 'Clean code is readable.',
      likelyFollowUp: ['Enforce code quality in CI', 'Repository pattern', 'SOLID in Python'],
    },
    prerequisites: ['python-oop', 'python-exceptions'],
    relatedTopics: ['python-rest-apis', 'python-testing'],
    references: [
      { title: 'PEP 8', url: 'https://peps.python.org/pep-0008/', source: 'python.org', type: 'official' },
    ],
  },
];
