import type { LearningTopic } from '../../../types';

const T = 'python';

export const pythonFundamentalsTopics: LearningTopic[] = [
  {
    id: 'python-generators-iterators',
    technology: T,
    title: 'Generators, Iterators & Itertools',
    category: 'Python Fundamentals',
    slug: 'python-generators-iterators',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Iterators produce values one at a time. Generators (functions with yield) are concise iterators that remember state. Use them for memory-efficient streaming and lazy evaluation.',
    mentalModel:
      'A list holds all values in memory. An iterator gives you one value at a time, like a vending machine dispensing one item per button press.',
    memoryTip:
      'Iterator = __iter__ + __next__. Generator = function with yield. iter() makes iterable → iterator. next() fetches next value. StopIteration signals end.',
    keyTerms: ['iterator', 'iterable', 'generator', 'yield', 'yield from', 'itertools', 'lazy evaluation', 'StopIteration'],
    interviewAnswer: `**Iterator** protocol: an object is an iterator if it implements __iter__ (returns self) and __next__ (returns next value or raises StopIteration). Calling iter(some_list) returns an iterator.

**Generators** are iterators defined with a function containing yield. They pause execution on yield and resume on next() call. This makes them memory-efficient for large/infinite sequences.

**Generator expression** vs list comprehension: (x*2 for x in data) is lazy; [x*2 for x in data] builds the whole list immediately.

**itertools**: battery of iterator tools — count, cycle, repeat, chain, groupby, combinations, permutations, accumulate. Use them instead of writing custom loops.

**yield from** (Python 3.3+) delegates iteration to a sub-generator, useful for flattening nested iterables.`,
    codeExample: `# Generator function for streaming large file lines
def read_large_file(path: str):
    with open(path, 'r') as f:
        for line in f:
            yield line.strip()  # lazy, one line at a time

# Generator expression — memory efficient
squares = (x ** 2 for x in range(1_000_000))
print(sum(squares))  # sum is computed without storing all squares

# Iterator protocol manually
class CountDown:
    def __init__(self, start: int):
        self.start = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.start <= 0:
            raise StopIteration
        self.start -= 1
        return self.start + 1

for n in CountDown(3):
    print(n)  # 3, 2, 1

# itertools.groupby for consecutive groups
from itertools import groupby
for status, group in groupby(['P', 'P', 'F', 'P', 'F', 'F']):
    print(status, len(list(group)))  # P 2, F 1, P 1, F 2`,
    codeLanguage: 'python',
    commonMistakes: [
      'Using list comprehension when a generator would suffice — wastes memory.',
      'Consuming a generator twice — generators are single-use; use itertools.tee or convert to list if needed multiple times.',
      'Not handling StopIteration explicitly when calling next() directly.',
      'Trying to index a generator with [] or len() — generators are not sequences.',
    ],
    seniorInsight: 'Generators are perfect for streaming data: reading logs, processing CSV rows, paginating API results. They keep memory constant regardless of dataset size. In banking, process transactions as a stream, not by loading the whole table into memory.',
    aiAwareness: {
      strongAnswerShouldMention: ['yield pauses execution', 'lazy evaluation', 'single-use', 'itertools', 'generator expression vs list comprehension'],
      weakAnswer: 'Generators are functions that return multiple values.',
      likelyFollowUp: ['Convert a recursive function to a generator', 'Implement range() as a generator', 'When to use yield from?'],
    },
    relatedTopics: ['python-decorators', 'python-exceptions'],
    references: [
      { title: 'Python Generators', url: 'https://docs.python.org/3/tutorial/classes.html#generators', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-decorators',
    technology: T,
    title: 'Decorators & Higher-Order Functions',
    category: 'Python Fundamentals',
    slug: 'python-decorators',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A decorator is a function that takes a function as input and returns a wrapped function. Used for logging, caching, auth, retry, and timing without changing the original code.',
    mentalModel:
      'Decorator = wrapping paper. You wrap a gift (function) with extra behavior (logging, retry) without opening the gift.',
    memoryTip:
      '@decorator above def. Decorator returns wrapper. functools.wraps preserves metadata. @ wraps arguments and optional parentheses.',
    keyTerms: ['decorator', 'higher-order function', 'wrapper', 'functools.wraps', 'closure', 'parameterized decorator', 'lru_cache'],
    interviewAnswer: `**Decorators** are higher-order functions: they accept a function as an argument and return a new function (wrapper) that usually calls the original.

**How it works:**
@my_decorator
def hello(): pass
is equivalent to hello = my_decorator(hello).

**functools.wraps:**
Without it, the wrapper function would expose its own name/docstring instead of the original. Always use @wraps(func) on inner wrapper.

**Common decorators:**
- @lru_cache / @cache — memoization.
- @retry — retry on failure with backoff.
- @timer — measure execution time.
- @require_auth — check authentication before endpoint.
- @log_call — audit logging.

**Parameterized decorators:**
@repeat(3) requires two levels of functions: the outer takes the parameter and returns the actual decorator.

**Closures:**
The wrapper remembers variables from the enclosing scope (like the original func). This is what makes decorators work.`,
    codeExample: `import functools
import time

# Basic decorator with timing and logging
def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f'{func.__name__}({args}, {kwargs}) -> {elapsed:.4f}s')
        return result
    return wrapper

@log_calls
def transfer_funds(amount: float, currency: str) -> str:
    time.sleep(0.01)
    return f'Transferred {amount} {currency}'

# Parameterized decorator: retry
def retry(max_attempts: int = 3, exceptions: type[Exception] = Exception):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        raise
                    print(f'Attempt {attempt} failed: {e}. Retrying...')
        return wrapper
    return decorator

@retry(max_attempts=3, exceptions=ConnectionError)
def fetch_exchange_rate():
    # might raise ConnectionError
    return 1.25

# Caching decorator from standard library
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    codeLanguage: 'python',
    commonMistakes: [
      'Forgetting @functools.wraps — loses original function name/docstring.',
      'Returning wrapper() instead of wrapper (calling it immediately).',
      'Not preserving *args, **kwargs in wrapper signature.',
      'Making parameterized decorator with only one function level.',
    ],
    seniorInsight: 'Decorators are the cleanest way to add cross-cutting concerns: logging, retries, caching, auth, metrics. In banking, use them for idempotency checks, audit logging of service calls, and circuit-breaker wrapping. Keep decorators focused — one responsibility per decorator.',
    aiAwareness: {
      strongAnswerShouldMention: ['higher-order function', 'wrapper', 'functools.wraps', 'closure', 'lru_cache', 'parameterized decorator'],
      weakAnswer: 'Decorators add behavior to functions.',
      likelyFollowUp: ['Implement retry decorator with exponential backoff', 'How does functools.wraps help?', 'Class-based vs function-based decorators'],
    },
    prerequisites: ['python-generators-iterators'],
    relatedTopics: ['python-rest-apis', 'python-exceptions'],
    references: [
      { title: 'Python Decorators', url: 'https://docs.python.org/3/glossary.html#term-decorator', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-exceptions',
    technology: T,
    title: 'Exception Handling & Clean Code',
    category: 'Python Fundamentals',
    slug: 'python-exceptions',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Exceptions handle errors gracefully. Catch specific exceptions, avoid bare except, use finally for cleanup, and create custom exceptions for domain errors.',
    mentalModel:
      'Exceptions are the eject button. They stop normal flow and jump to a handler. Use them for truly exceptional situations, not regular control flow.',
    memoryTip:
      'Catch specific, not bare except. finally for cleanup. with statements for context managers. Custom exceptions inherit Exception. raise from for chaining.',
    keyTerms: ['try/except/finally', 'raise', 'bare except', 'context manager', 'custom exception', 'exception chaining', 'EAFP'],
    interviewAnswer: `**Best practices:**
- Catch specific exceptions (ValueError, KeyError) rather than bare except.
- Use finally for cleanup: closing files, releasing locks, database connections.
- Prefer with statement (context managers) — auto-cleanup even on exceptions.
- Create custom exceptions for domain errors (InsufficientFundsError, InvalidAccountError).
- Use raise from when wrapping exceptions to preserve the original traceback.
- EAFP vs LBYL: Pythonic code often tries first and handles the exception ("easier to ask for forgiveness than permission").

**Anti-patterns:**
- Bare except: hides bugs like KeyboardInterrupt and SystemExit. Use except Exception at minimum.
- Swallowing exceptions: except: pass with no logging.
- Using exceptions for normal control flow (e.g., StopIteration manually).`,
    codeExample: `# Context manager for safe resource handling
class DatabaseConnection:
    def __enter__(self):
        self.conn = create_connection()
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        # return False to propagate exception

with DatabaseConnection() as conn:
    conn.execute('SELECT * FROM accounts')

# Custom exception with chaining
class TransferError(Exception):
    pass

def transfer(amount: float, account_id: str):
    try:
        account = get_account(account_id)
    except AccountNotFoundError as e:
        raise TransferError(f'Cannot transfer to {account_id}') from e
    if account.balance < amount:
        raise InsufficientFundsError('Balance too low')

# Specific exception handling
def get_port(value: str) -> int:
    try:
        port = int(value)
    except ValueError as e:
        raise ConfigError(f'Invalid port: {value}') from e
    if not 0 <= port <= 65535:
        raise ConfigError(f'Port out of range: {port}')
    return port`,
    codeLanguage: 'python',
    commonMistakes: [
      'Bare except: except: pass hides KeyboardInterrupt.',
      'Catching Exception when a narrower type would do.',
      'Not cleaning up resources in finally or context manager.',
      'Losing original traceback when re-raising — use raise ... from ...',
    ],
    seniorInsight: 'In banking, exceptions are part of the API contract. Define domain exceptions (InsufficientFundsError, FraudDetectedError) and document when each is raised. Never silently swallow errors — always log, metric, or re-raise. Use exception chaining so the root cause is preserved across service boundaries.',
    aiAwareness: {
      strongAnswerShouldMention: ['specific exceptions', 'finally/with cleanup', 'custom domain exceptions', 'raise from for chaining', 'EAFP pattern'],
      weakAnswer: 'Try/except catches errors so the program does not crash.',
      likelyFollowUp: ['When to create custom exceptions?', 'Difference between except: and except Exception:', 'Explain EAFP vs LBYL'],
    },
    prerequisites: ['python-generators-iterators'],
    relatedTopics: ['python-oop', 'python-rest-apis'],
    references: [
      { title: 'Python Errors and Exceptions', url: 'https://docs.python.org/3/tutorial/errors.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-oop',
    technology: T,
    title: 'Object-Oriented Programming in Python',
    category: 'Python Fundamentals',
    slug: 'python-oop',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Classes bundle data and behavior. Python supports inheritance, composition, dataclasses, and protocols (dunder methods). Prefer composition over deep inheritance.',
    mentalModel:
      'A class is a blueprint. An object is the built house. Methods are things the house can do. Composition lets you combine behaviors like LEGO blocks.',
    memoryTip:
      '__init__ constructor. self is the instance. @dataclass for simple data. __str__/__repr__ for readable prints. __eq__ for equality. Use ABC for interfaces.',
    keyTerms: ['class', 'instance', 'inheritance', 'composition', 'dataclass', 'dunder method', 'encapsulation', 'polymorphism', 'abstract base class'],
    interviewAnswer: `**Classes and objects:**
class Account: __init__ sets up state. self refers to the instance. Methods operate on instance data.

**Inheritance vs composition:**
Inheritance: "is-a" (SavingsAccount is an Account). Composition: "has-a" (Account has a Logger, has a CurrencyConverter). Prefer composition — more flexible, less fragile.

**Dataclasses:**
@dataclass automatically generates __init__, __repr__, __eq__. Best for data containers. Can be frozen=True for immutability.

**Dunder methods:**
__str__ (human-readable), __repr__ (developer-readable), __eq__ (equality), __hash__ (for use as dict key), __len__, __iter__. These make your objects Pythonic.

**Encapsulation:**
Convention: _protected, __private (name mangling). Use properties (@property) for computed attributes without breaking the interface.

**Abstract Base Classes (ABC):**
Use abc.ABC + @abstractmethod to define interfaces that subclasses must implement.`,
    codeExample: `from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: float
    currency: str

    def __add__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError('Cannot add different currencies')
        return Money(self.amount + other.amount, self.currency)

# Composition: an account has a balance and a logger
class ConsoleLogger:
    def log(self, message: str):
        print(f'[LOG] {message}')

class Account(ABC):
    def __init__(self, account_id: str, balance: Money, logger: ConsoleLogger):
        self._account_id = account_id
        self._balance = balance
        self._logger = logger

    @property
    def balance(self) -> Money:
        return self._balance

    @abstractmethod
    def withdraw(self, amount: Money):
        pass

class SavingsAccount(Account):
    def withdraw(self, amount: Money):
        if amount.amount > self._balance.amount:
            raise ValueError('Insufficient funds')
        self._balance = Money(self._balance.amount - amount.amount, self._balance.currency)
        self._logger.log(f'Withdrew {amount} from {self._account_id}')

account = SavingsAccount('ACC-001', Money(1000, 'USD'), ConsoleLogger())
account.withdraw(Money(100, 'USD'))
print(account.balance)  # Money(amount=900, currency='USD')`,
    codeLanguage: 'python',
    commonMistakes: [
      'Deep inheritance hierarchies — prefer composition.',
      'Mutating dataclass without frozen=False when immutability is desired.',
      'Forgetting self in method definitions.',
      'Using mutable default arguments in __init__ (e.g., self.transactions = []).',
    ],
    seniorInsight: 'Banking domain models are naturally OOP: Account, Transaction, Transfer, Customer. Use dataclasses for value objects (Money, Address), ABCs for repository interfaces, and composition for cross-cutting behavior (logging, validation, audit). Immutable value objects prevent a whole class of bugs.',
    aiAwareness: {
      strongAnswerShouldMention: ['dataclass', 'composition over inheritance', 'dunder methods', '@property', 'abstract base class'],
      weakAnswer: 'OOP is classes and objects.',
      likelyFollowUp: ['Dataclass vs NamedTuple', 'When to use inheritance?', 'Explain __str__ vs __repr__'],
    },
    prerequisites: ['python-lists-dicts-sets'],
    relatedTopics: ['python-decorators', 'python-rest-apis'],
    references: [
      { title: 'Python Data Classes', url: 'https://docs.python.org/3/library/dataclasses.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-concurrency',
    technology: T,
    title: 'Concurrency Basics: threading, asyncio, multiprocessing',
    category: 'Python Fundamentals',
    slug: 'python-concurrency',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'threading for I/O-bound parallelism (but limited by GIL), asyncio for cooperative I/O concurrency, multiprocessing for CPU-bound true parallelism across cores.',
    mentalModel:
      'Threading = many workers sharing one kitchen (GIL). Asyncio = one chef rapidly switching between tasks while waiting. Multiprocessing = separate kitchens (no GIL).',
    memoryTip:
      'I/O-bound → threading/asyncio. CPU-bound → multiprocessing. GIL prevents true thread parallelism for CPU work. async/await for asyncio. concurrent.futures for pools.',
    keyTerms: ['GIL', 'threading', 'asyncio', 'async/await', 'multiprocessing', 'concurrent.futures', 'ThreadPoolExecutor', 'ProcessPoolExecutor', 'coroutine'],
    interviewAnswer: `**GIL (Global Interpreter Lock):**
Only one thread can execute Python bytecode at a time. This means threads do NOT give true parallelism for CPU-bound Python code. But for I/O-bound code (network, disk), threads are useful because the GIL is released during I/O waits.

**threading:**
Use ThreadPoolExecutor for I/O-bound tasks: parallel API calls, file reads, database queries. Locks (threading.Lock) protect shared state, but prefer message passing.

**asyncio:**
Single-threaded cooperative multitasking. async def defines coroutines; await yields control. Best for many concurrent I/O connections (web servers, chat). Frameworks: FastAPI, aiohttp. No CPU parallelism because it's single-threaded.

**multiprocessing:**
Spawns separate processes, each with its own Python interpreter and memory. True parallelism across CPU cores. Use ProcessPoolExecutor for CPU-bound work: image processing, heavy calculations, data transformation. Communication via queues/pipes.

**When to use what:**
| Workload | Use |
|----------|-----|
| Many API calls | asyncio or ThreadPoolExecutor |
| Web server (FastAPI) | asyncio |
| Data processing, ML inference | multiprocessing |
| Simple background tasks | threading |`,
    codeExample: `import asyncio
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# asyncio: concurrent API calls
async def fetch_user(user_id: int) -> dict:
    await asyncio.sleep(0.1)  # simulate network
    return {'id': user_id, 'name': f'User {user_id}'}

async def main():
    users = await asyncio.gather(*(fetch_user(i) for i in range(10)))
    print(f'Fetched {len(users)} users')

asyncio.run(main())

# ThreadPoolExecutor for I/O-bound work
def fetch_url(url: str):
    import requests
    return requests.get(url, timeout=5).status_code

urls = ['https://api1.example.com', 'https://api2.example.com']
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(fetch_url, urls))

# ProcessPoolExecutor for CPU-bound work
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

numbers = [112272535095293, 115280095190773]
with ProcessPoolExecutor(max_workers=4) as executor:
    print(list(executor.map(is_prime, numbers)))`,
    codeLanguage: 'python',
    commonMistakes: [
      'Using threading for CPU-bound Python work — GIL prevents speedup.',
      'Using asyncio without await — coroutine objects never run.',
      'Sharing mutable state across multiprocessing processes — each process has its own memory.',
      'Creating too many threads/processes — match to CPU cores / I/O capacity.',
    ],
    seniorInsight: 'Banking backend services are usually I/O-bound (database, payment gateways). Use asyncio with FastAPI for APIs, ThreadPoolExecutor for blocking SDK calls, and multiprocessing only for heavy report generation or ML feature computation. Avoid shared mutable state — pass messages.',
    aiAwareness: {
      strongAnswerShouldMention: ['GIL limits CPU threading', 'asyncio for I/O concurrency', 'multiprocessing for CPU parallelism', 'ThreadPoolExecutor for blocking I/O'],
      weakAnswer: 'Use threads to make things faster.',
      likelyFollowUp: ['Why does GIL matter?', 'When to use asyncio vs threads?', 'How do processes share data?'],
    },
    prerequisites: ['python-generators-iterators'],
    relatedTopics: ['python-rest-apis', 'python-exceptions'],
    references: [
      { title: 'asyncio — Asynchronous I/O', url: 'https://docs.python.org/3/library/asyncio.html', source: 'python.org', type: 'official' },
    ],
  },
];
