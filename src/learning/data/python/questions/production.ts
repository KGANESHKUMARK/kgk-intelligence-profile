import type { InterviewQuestion } from '../../../types';

export const pythonProductionQuestions: InterviewQuestion[] = [
  {
    id: 'q-python-fastapi-validation',
    technology: 'python',
    question: 'How does FastAPI use Pydantic to validate and document API requests?',
    category: 'Production Engineering',
    difficulty: 'intermediate',
    quickAnswer: 'Pydantic models define request/response schemas. FastAPI reads type hints and Field constraints to validate input and generate OpenAPI docs automatically.',
    interviewAnswer: `In FastAPI, request and response models inherit from pydantic.BaseModel. FastAPI inspects the type hints on route parameters and response_model. When a request arrives, FastAPI parses the JSON and creates the Pydantic model, which validates types and constraints.

Field(...) allows constraints like min_length, gt, regex patterns, and examples. If validation fails, FastAPI returns a 422 Unprocessable Entity with detailed error messages.

Response models control what is serialized and returned, ensuring you do not leak internal fields.

OpenAPI/Swagger docs are generated from these models and are available at /docs.`,
    codeExample: `from fastapi import FastAPI
from pydantic import BaseModel, Field, EmailStr

app = FastAPI()

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, example='Alice')
    email: EmailStr
    age: int = Field(..., gt=0, lt=150)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

@app.post('/users', response_model=UserResponse, status_code=201)
def create_user(user: UserCreate):
    # user is already validated
    return {'id': 1, 'name': user.name, 'email': user.email}

# Invalid: age=-5 returns 422 with detailed error body`,
    codeLanguage: 'python',
    keyTerms: ['Pydantic', 'BaseModel', 'Field', 'response_model', '422', 'OpenAPI'],
    conceptsTested: ['FastAPI', 'Validation'],
    strongAnswerKeywords: ['BaseModel schema', 'Field constraints', '422 validation errors', 'OpenAPI auto-generated'],
    whatIsBeingTested: ['API validation knowledge'],
    interviewerIntent: 'Tests practical FastAPI/Pydantic usage.',
  },

  {
    id: 'q-python-pytest-mock',
    technology: 'python',
    question: 'How do you test code that calls an external API in Python?',
    category: 'Production Engineering',
    difficulty: 'intermediate',
    quickAnswer: 'Use unittest.mock.patch to replace the external call with a controlled Mock object. Assert the mock was called correctly and verify returned values.',
    interviewAnswer: `Use unittest.mock.patch to mock the function or method that makes the external request. Patch where the function is used ("patch where it is looked up"), not where it is defined, to ensure your test intercepts the actual call.

For HTTP-level mocking, use responses (for requests) or HTTPX mock transports. For broader coverage, use pytest-httpx or mount responses mock.

Keep mocks focused on boundaries. Do not mock every internal helper — test behavior through the public interface.

Complexity and test cases: happy path returns expected data, error path raises the correct exception, timeout path handles gracefully.`,
    codeExample: `from unittest.mock import patch, Mock
import pytest
from myapp.payments import process_payment

@patch('myapp.payments.call_payment_gateway')
def test_process_payment_success(mock_gateway):
    mock_gateway.return_value = {'status': 'approved', 'id': 'pay_123'}

    result = process_payment(amount=100.0, currency='USD')

    assert result['status'] == 'approved'
    mock_gateway.assert_called_once_with(amount=100.0, currency='USD')

@patch('myapp.payments.call_payment_gateway')
def test_process_payment_failure(mock_gateway):
    mock_gateway.side_effect = ConnectionError('timeout')

    with pytest.raises(PaymentError):
        process_payment(amount=100.0, currency='USD')`,
    codeLanguage: 'python',
    keyTerms: ['mock.patch', 'Mock', 'side_effect', 'assert_called_once_with', 'responses'],
    conceptsTested: ['Testing', 'Mocking'],
    strongAnswerKeywords: ['patch where used', 'Mock.return_value', 'side_effect for exceptions', 'boundary mocking'],
    whatIsBeingTested: ['Testing external dependencies'],
    interviewerIntent: 'Tests mocking best practices in Python.',
  },

  {
    id: 'q-python-structured-logging',
    technology: 'python',
    question: 'Why is structured logging preferred over plain print statements in production?',
    category: 'Production Engineering',
    difficulty: 'intermediate',
    quickAnswer: 'Structured logs (JSON) include consistent fields like timestamp, level, request_id, and message, making them searchable, aggregatable, and traceable across services.',
    interviewAnswer: `Plain print statements output free-form text that is hard to parse, filter, and aggregate. In production, you need to:
- Search logs by field (e.g., user_id=123, request_id=abc).
- Aggregate metrics (count errors by endpoint).
- Correlate requests across microservices using a shared correlation ID.
- Alert on patterns (error rate > threshold).

Structured logging outputs JSON with fixed schema fields. Python's logging module can be configured with a JSON formatter (python-json-logger) or use structlog.

Also include severity levels, source file, line number, and exception tracebacks. Centralize logs in ELK, Splunk, Datadog, or CloudWatch.`,
    codeExample: `import logging
import sys
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
log_handler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter(
    '%(timestamp)s %(level)s %(name)s %(message)s %(request_id)s',
    rename_fields={'levelname': 'level'},
)
log_handler.setFormatter(formatter)
logger.addHandler(log_handler)
logger.setLevel(logging.INFO)

# Usage
extra = {'request_id': 'req-123'}
logger.info('Payment processed', extra=extra)`,
    codeLanguage: 'python',
    keyTerms: ['structured logging', 'JSON formatter', 'correlation ID', 'centralized logging', 'observability'],
    conceptsTested: ['Production logging'],
    strongAnswerKeywords: ['JSON output', 'searchable fields', 'correlation ID', 'aggregation', 'centralized'],
    whatIsBeingTested: ['Production observability mindset'],
    interviewerIntent: 'Tests production logging discipline.',
  },

  {
    id: 'q-python-clean-architecture',
    technology: 'python',
    question: 'How would you structure a FastAPI project for maintainability and testability?',
    category: 'Production Engineering',
    difficulty: 'advanced',
    quickAnswer: 'Separate routes, services, repositories, models, and schemas. Use dependency injection. Tests use fakes at repository boundaries.',
    interviewAnswer: `Recommended structure:
- main.py: app factory and route registration.
- routers/: FastAPI route handlers, only HTTP concerns.
- services/: business logic and use cases.
- repositories/: data access abstraction.
- models/: Pydantic schemas and domain entities.
- dependencies/: reusable Depends() providers.
- tests/: mirror app structure, use fakes/mocks.

Dependency injection via FastAPI Depends() lets you swap real repositories for fakes in tests. Services accept repository interfaces (protocols or abstract classes), not concrete implementations.

This separation means:
- Routes are thin and easy to test with TestClient.
- Services are pure business logic, testable without HTTP or DB.
- Repositories isolate DB details; swapping to a fake or in-memory DB is trivial.

Avoid global state and singletons. Pass dependencies explicitly.`,
    codeExample: `# routers/payments.py
from fastapi import APIRouter, Depends
from myapp.services.payments import PaymentService
from myapp.dependencies import get_payment_service

router = APIRouter()

@router.post('/payments')
def create_payment(payload: PaymentCreate, service: PaymentService = Depends(get_payment_service)):
    return service.process(payload)

# services/payments.py
class PaymentService:
    def __init__(self, repo: PaymentRepository):
        self.repo = repo

    def process(self, payload: PaymentCreate):
        payment = Payment(**payload.dict())
        self.repo.save(payment)
        return payment

# tests/test_payments.py
class FakeRepo(PaymentRepository):
    def __init__(self):
        self.payments = []
    def save(self, payment):
        self.payments.append(payment)

def test_payment_service():
    service = PaymentService(FakeRepo())
    result = service.process(PaymentCreate(amount=100, currency='USD'))
    assert result.amount == 100`,
    codeLanguage: 'python',
    keyTerms: ['FastAPI', 'dependency injection', 'repository pattern', 'service layer', 'testability'],
    conceptsTested: ['Architecture'],
    strongAnswerKeywords: ['routes/services/repositories', 'Depends()', 'fake repository', 'no global state'],
    whatIsBeingTested: ['Project architecture and separation of concerns'],
    interviewerIntent: 'Tests ability to design maintainable Python services.',
  },
];
