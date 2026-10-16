import type { InterviewQuestion } from '../../../types';

export const pythonFundamentalsQuestions: InterviewQuestion[] = [
  {
    id: 'q-python-decorator-retry',
    technology: 'python',
    question: 'Implement a retry decorator with exponential backoff.',
    category: 'Python Fundamentals',
    difficulty: 'intermediate',
    quickAnswer: 'Outer function takes retry config and returns a decorator. Inner wrapper catches exceptions, waits with exponential backoff, retries, then re-raises on final failure.',
    interviewAnswer: `A parameterized decorator needs two nested functions: one to accept parameters (max_attempts, exceptions), and one to accept the function being decorated. The innermost wrapper loops, calling the original function. On allowed exceptions, it sleeps using backoff and retries. On the final attempt, it re-raises.

Use functools.wraps to preserve the original function's metadata. Import time for sleep. Handle jitter if discussing production robustness.

Complexity: O(1) decorator setup, O(attempts) per call.

Edge cases: max_attempts = 1 (no retry), non-retryable exceptions should propagate immediately, sleep can be replaced with async sleep for async functions.`,
    codeExample: `import functools
import time

def retry(max_attempts: int = 3, backoff: float = 1.0, exceptions: tuple[type[Exception], ...] = (Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        raise
                    sleep_time = backoff * (2 ** (attempt - 1))
                    print(f'Retry {attempt}/{max_attempts} after {sleep_time}s: {e}')
                    time.sleep(sleep_time)
            return None  # unreachable
        return wrapper
    return decorator

@retry(max_attempts=3, exceptions=(ConnectionError,))
def fetch_data():
    # Simulate transient failure
    fetch_data.calls = getattr(fetch_data, 'calls', 0) + 1
    if fetch_data.calls < 3:
        raise ConnectionError('network down')
    return 'data'

assert fetch_data() == 'data'`,
    keyTerms: ['decorator', 'functools.wraps', 'exponential backoff', 'retry'],
    conceptsTested: ['Decorators', 'Closures'],
    strongAnswerKeywords: ['parameterized decorator', 'functools.wraps', 'exponential backoff', 'reraise on last attempt'],
    whatIsBeingTested: ['Decorator implementation'],
    interviewerIntent: 'Tests deep understanding of decorators and closures.',
  },

  {
    id: 'q-python-generator-stream',
    technology: 'python',
    question: 'Write a generator that streams lines from a large file and yields only lines matching a predicate.',
    category: 'Python Fundamentals',
    difficulty: 'intermediate',
    quickAnswer: 'Use a generator function that opens the file with with statement, iterates line by line, and yields matching lines. Memory stays constant.',
    interviewAnswer: `Approach: define a generator function that takes a file path and a predicate. Open the file using a with statement (ensures closure even on exceptions). Iterate over the file object line by line — Python reads lazily from disk. Apply the predicate and yield matching lines stripped of newline.

Complexity: O(n) to process all lines, but O(1) memory because only one line is in memory at a time.

Edge cases: file does not exist (let caller handle or raise), predicate matches nothing (generator is empty), very long lines, encoding issues.`,
    codeExample: `from collections.abc import Callable

def stream_matching_lines(path: str, predicate: Callable[[str], bool]):
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            stripped = line.rstrip('\n')
            if predicate(stripped):
                yield stripped

# Usage: stream error lines from a log
for line in stream_matching_lines('app.log', lambda s: 'ERROR' in s):
    print(line)

# Composable: count without loading all lines
count = sum(1 for _ in stream_matching_lines('app.log', lambda s: 'payment' in s.lower()))`,
    keyTerms: ['generator', 'yield', 'lazy evaluation', 'with statement'],
    conceptsTested: ['Generators', 'File I/O'],
    strongAnswerKeywords: ['generator function', 'with open', 'line-by-line', 'O(1) memory', 'lazy'],
    whatIsBeingTested: ['Streaming and memory-efficient processing'],
    interviewerIntent: 'Tests generator usage and memory-conscious file processing.',
  },

  {
    id: 'q-python-context-manager',
    technology: 'python',
    question: 'Implement a context manager that measures execution time and logs it.',
    category: 'Python Fundamentals',
    difficulty: 'intermediate',
    quickAnswer: 'Use contextlib.contextmanager decorator with yield, or a class with __enter__ and __exit__. Record start time on enter, log elapsed on exit.',
    interviewAnswer: `Two approaches: class-based (define __enter__ and __exit__) or function-based using @contextmanager from contextlib. The class approach is more flexible for complex state; the function-based approach is concise.

__enter__ returns the object bound to as. __exit__ receives exception info; returning True suppresses the exception.

Complexity: O(1).

Edge cases: exceptions inside the block should still be timed and logged; decide whether to suppress or propagate.`,
    codeExample: `import time
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

@contextmanager
def timed(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(f'{label} took {elapsed:.4f}s')

# Usage
with timed('database query'):
    result = run_query()

# Class-based version
class Timer:
    def __init__(self, label: str):
        self.label = label
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.perf_counter() - self.start
        logger.info(f'{self.label} took {elapsed:.4f}s')
        # return False to propagate any exception`,
    codeLanguage: 'python',
    keyTerms: ['context manager', 'contextlib', 'yield', '__enter__', '__exit__', 'timer'],
    conceptsTested: ['Context managers'],
    strongAnswerKeywords: ['@contextmanager', '__enter__/__exit__', 'yield', 'finally for cleanup'],
    whatIsBeingTested: ['Understanding of context managers'],
    interviewerIntent: 'Tests context manager implementation and cleanup semantics.',
  },

  {
    id: 'q-python-gil',
    technology: 'python',
    question: 'What is the GIL and when does it matter?',
    category: 'Python Fundamentals',
    difficulty: 'intermediate',
    quickAnswer: 'GIL = Global Interpreter Lock. Only one thread executes Python bytecode at a time. It limits CPU-bound thread parallelism; I/O-bound threads still benefit.',
    interviewAnswer: `The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously. This means threads do NOT provide true parallelism for CPU-bound work in CPython.

For I/O-bound work (network, disk), threads are still useful because the GIL is released during I/O waits, allowing other threads to run.

For CPU-bound parallelism, use multiprocessing (separate processes, each with its own GIL and memory) or alternative interpreters without a GIL (Jython, experimental no-GIL CPython).

asyncio is single-threaded cooperative concurrency; it is not affected by the GIL in the same way because it uses one event loop.

Consequence: threading.Thread will not speed up a CPU-bound calculation, but it will speed up making many concurrent HTTP requests.`,
    keyTerms: ['GIL', 'threading', 'CPU-bound', 'I/O-bound', 'multiprocessing', 'asyncio'],
    conceptsTested: ['Concurrency'],
    strongAnswerKeywords: ['Global Interpreter Lock', 'one thread bytecode at a time', 'CPU-bound limited', 'I/O still benefits', 'multiprocessing for CPU'],
    whatIsBeingTested: ['Understanding of Python concurrency limitations'],
    interviewerIntent: 'Tests whether candidate understands when threads help vs when they do not.',
  },

  {
    id: 'q-python-dataclass-vs-dict',
    technology: 'python',
    question: 'When would you use a dataclass instead of a plain dict?',
    category: 'Python Fundamentals',
    difficulty: 'intermediate',
    quickAnswer: 'Dataclasses give type safety, immutability option, generated methods (__init__, __repr__, __eq__), and better IDE support. Use dicts for dynamic data and dataclasses for domain models.',
    interviewAnswer: `Use a dataclass when you have a fixed schema and want:
- Type hints and IDE autocomplete.
- Auto-generated __init__, __repr__, __eq__.
- Immutability option (frozen=True).
- Validation hooks (__post_init__).
- Hashability (frozen dataclasses can be used as dict keys).

Use a dict when the data is dynamic, arbitrary keys are expected, or you need JSON serialization without conversion.

Dataclasses reduce typo bugs (amount vs ammount) and make refactorings safer. They are ideal for domain value objects like Money, Address, PaymentRequest.

For nested JSON, use Pydantic models instead of plain dataclasses for automatic validation and serialization.`,
    codeExample: `from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError('Amount cannot be negative')
        if len(self.currency) != 3:
            raise ValueError('Currency must be ISO 4217 code')

m1 = Money(Decimal('100.00'), 'USD')
m2 = Money(Decimal('100.00'), 'USD')
assert m1 == m2
assert hash(m1) == hash(m2)  # frozen dataclass is hashable`,
    codeLanguage: 'python',
    keyTerms: ['dataclass', 'frozen', 'type safety', '__post_init__', 'value object'],
    conceptsTested: ['OOP', 'Dataclasses'],
    strongAnswerKeywords: ['type safety', 'auto-generated methods', 'frozen immutability', 'validation hooks', 'value objects'],
    whatIsBeingTested: ['When to use dataclasses'],
    interviewerIntent: 'Tests domain modeling judgment and type safety awareness.',
  },
];
