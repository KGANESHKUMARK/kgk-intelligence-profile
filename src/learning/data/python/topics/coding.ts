import type { LearningTopic } from '../../../types';

const T = 'python';

export const pythonCodingTopics: LearningTopic[] = [
  {
    id: 'python-lists-dicts-sets',
    technology: T,
    title: 'Lists, Dictionaries & Sets',
    category: 'Python Coding',
    slug: 'python-lists-dicts-sets',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'List is ordered and mutable, dict maps keys to values with O(1) lookup, set is unordered with unique elements and fast membership testing.',
    mentalModel:
      'List = todo list (ordered, duplicates allowed). Dict = phone book (key → value lookup). Set = bag of unique names.',
    memoryTip:
      'list[] = ordered + duplicates. dict{} = key→value. set{} = unique only. Use set/dict when you need membership (in) tests.',
    keyTerms: ['list', 'dict', 'set', 'tuple', 'mutable', 'hashable', 'comprehension', 'Big-O'],
    interviewAnswer: `Python's core collection types:

**list**: Ordered sequence, mutable, allows duplicates. Indexing/slicing, append/pop, sort, reverse. O(1) for append (amortized) and indexing, O(n) for search and insert/delete at arbitrary position.

**dict**: Key-value map. Keys must be hashable. O(1) average lookup/insert/delete. Since Python 3.7+, insertion order is preserved (implementation detail in 3.7, language guarantee in 3.8+). Use dict.get() for safe retrieval with default.

**set**: Unordered collection of unique hashable items. O(1) average membership test. Use sets for deduplication and set operations (union, intersection, difference). Cannot contain lists/dicts (unhashable types).

**tuple**: Immutable sequence. Often used as dict keys (must be hashable) and for returning multiple values.`,
    codeExample: `from collections import Counter

# Deduplication with a set
emails = ['a@x.com', 'b@x.com', 'a@x.com', 'c@x.com']
unique_emails = list(set(emails))  # order lost; use dict.fromkeys() to preserve

# Phone-book lookup — dict
user_roles = {'alice': 'admin', 'bob': 'user', 'carol': 'user'}
print(user_roles.get('bob', 'unknown'))  # safe retrieval

# Counting with dict comprehension
words = ['apple', 'banana', 'apple', 'cherry']
counts = {word: words.count(word) for word in set(words)}
# Better: Counter(words)

# Set operations
a = {1, 2, 3}
b = {2, 3, 4}
print(a & b)  # {2, 3} intersection
print(a | b)  # {1, 2, 3, 4} union`,
    codeLanguage: 'python',
    commonMistakes: [
      'Using a list to check membership in a large collection — O(n) vs set O(1).',
      'Modifying a list while iterating over it — use a new list or iterate over a copy.',
      'Using mutable objects (lists) as dict keys — TypeError: unhashable type.',
      'Not preserving order when deduplicating — use dict.fromkeys(items) for Python 3.7+ instead of set(items).',
    ],
    seniorInsight: 'In production code, prefer Counter from collections for frequency counting, defaultdict for grouping, and set/dict for lookups over linear scans. The right data structure usually makes the algorithm obvious.',
    aiAwareness: {
      strongAnswerShouldMention: ['list ordered mutable', 'dict O(1) lookup', 'set membership O(1)', 'hashable keys', 'Counter for frequencies'],
      weakAnswer: 'Lists store data, dicts store key-value pairs, sets have unique items.',
      likelyFollowUp: ['When would you use a set over a list?', 'Why must dict keys be hashable?', 'How do you deduplicate while preserving order?'],
    },
    relatedTopics: ['python-sorting-searching', 'python-frequency-common'],
    references: [
      { title: 'Python Built-in Types', url: 'https://docs.python.org/3/library/stdtypes.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-strings',
    technology: T,
    title: 'String Manipulation & Parsing',
    category: 'Python Coding',
    slug: 'python-strings',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'Python strings are immutable sequences of Unicode characters. Slicing, methods, f-strings, and regular expressions cover most parsing needs.',
    mentalModel:
      'Strings are read-only; every method returns a NEW string. Slice like lists. Use str.join() to concatenate without creating many temporary objects.',
    memoryTip:
      'f"Hello {name}" for interpolation. s.split() for tokens. s.strip() for cleanup. "".join(list) for efficient concat. re for patterns.',
    keyTerms: ['f-string', 'slicing', 'split', 'join', 'strip', 'format', 'regular expression', 'unicode'],
    interviewAnswer: `**Strings are immutable** — methods like .upper(), .replace(), .strip() return new strings; the original is unchanged. Concatenating in a loop with += creates O(n²) copies; use str.join() for O(n).

**Common operations:**
- s.split(sep) / s.rsplit(sep, maxsplit) — tokenize.
- s.strip(), s.lstrip(), s.rstrip() — remove surrounding whitespace.
- s.startswith(prefix), s.endswith(suffix) — fast checks.
- s.find(needle) returns index or -1; s.index raises ValueError.
- s.replace(old, new) returns new string.
- s[::-1] reverses a string via slicing.

**f-strings** (Python 3.6+) are the preferred formatting method: f"balance: \${amount:.2f}". They are faster and more readable than % formatting or .format().

**Regular expressions** (re module): use for pattern matching, but avoid over-engineering — for simple splits, use str methods first.`,
    codeExample: `# Palindrome check: O(n) time, O(n) space

def is_palindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

# Efficient concatenation
tokens = ['Hello', 'world', 'from', 'Python']
message = ' '.join(tokens)  # O(n)
# BAD: result = ''; for t in tokens: result += t + ' '  # O(n²)

# Tokenize CSV-ish line with validation
line = '  100.50, USD, Alice  '
amount, currency, name = [part.strip() for part in line.split(',')]

# f-string formatting
print(f"Amount: {float(amount):.2f} {currency.upper()} — {name.title()}")

# Regex for simple account number validation
import re
pattern = re.compile(r'^ACC-\d{6}$')
print(pattern.match('ACC-123456'))  # match`,
    codeLanguage: 'python',
    commonMistakes: [
      'Concatenating strings with += in a loop — use join().',
      'Not normalizing case/whitespace before comparison.',
      'Overusing regex for simple tasks — str methods are faster and clearer.',
      'Forgetting strings are immutable — trying s[0] = "x" raises TypeError.',
    ],
    seniorInsight: 'In banking, strings appear in account numbers, currency formatting, CSV parsing, and audit logs. Always validate/sanitize input (strip whitespace, normalize case, reject invalid regex matches) before processing.',
    aiAwareness: {
      strongAnswerShouldMention: ['immutable', 'join for concat', 'f-strings', 'slicing', 'strip/normalize', 'regex for patterns'],
      weakAnswer: 'Strings hold text and you can concatenate them.',
      likelyFollowUp: ['Reverse a string efficiently', 'Check if a string is a palindrome', 'Parse a CSV line safely'],
    },
    relatedTopics: ['python-lists-dicts-sets', 'python-sorting-searching'],
    references: [
      { title: 'Python String Methods', url: 'https://docs.python.org/3/library/string.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-sorting-searching',
    technology: T,
    title: 'Sorting & Searching Patterns',
    category: 'Python Coding',
    slug: 'python-sorting-searching',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'sorted() returns a new sorted list; list.sort() sorts in place. Use key= for custom ordering. Binary search needs sorted data and runs in O(log n).',
    mentalModel:
      'Sorting reorganizes elements. Searching finds an element. A sorted collection enables O(log n) search; a hash map enables O(1) average search.',
    memoryTip:
      'sorted(iterable) returns list. list.sort(key=func) in place. bisect for binary search in sorted list. sorted(..., reverse=True).',
    keyTerms: ['Timsort', 'sorted', 'sort', 'key function', 'binary search', 'bisect', 'O(n log n)', 'O(log n)'],
    interviewAnswer: `**Sorting:**
Python's built-in sort uses Timsort, a hybrid of merge sort and insertion sort. Stable sort, O(n log n) worst case.
- sorted(data) returns a NEW sorted list.
- data.sort() sorts IN PLACE and returns None.
- Use key= for custom sort: sorted(transactions, key=lambda t: t['amount'], reverse=True).
- Sort tuples naturally by first element, then second.
- itemgetter/attrgetter from operator module are faster than lambdas.

**Searching:**
- Linear search: x in list — O(n).
- Binary search: requires sorted data, O(log n). Use bisect_left/right from bisect module to find insertion points.
- Hash lookup: x in set or dict — O(1) average.

**When to sort vs use a hash map:**
- If you need to find duplicates/most frequent → Counter (hash map) is O(n).
- If you need the top k elements → heapq.nlargest(k, data) is O(n log k), or Counter.most_common(k).
- If the list is already sorted and you do many lookups → maintain sorted + bisect.`,
    codeExample: `from bisect import bisect_left
from operator import itemgetter

transactions = [
    {'id': 't1', 'amount': 250, 'date': '2024-01-10'},
    {'id': 't2', 'amount': 500, 'date': '2024-01-12'},
    {'id': 't3', 'amount': 100, 'date': '2024-01-11'},
]

# Sort by amount descending
sorted_txns = sorted(transactions, key=itemgetter('amount'), reverse=True)

# Sort in place by date
transactions.sort(key=itemgetter('date'))

# Binary search on sorted amounts
amounts = sorted([100, 250, 500, 750, 1000])
def binary_search(arr, target):
    idx = bisect_left(arr, target)
    return idx < len(arr) and arr[idx] == target

print(binary_search(amounts, 500))   # True
print(binary_search(amounts, 300))   # False`,
    codeLanguage: 'python',
    commonMistakes: [
      'Calling .sort() and expecting a return value — returns None.',
      'Using x in list for frequent lookups on large data — convert to set for O(1).',
      'Sorting when a hash map/Counter would solve the problem in O(n).',
      'Forgetting that sorting changes the original list when using .sort().',
    ],
    seniorInsight: 'The interview "trick" is often choosing the right data structure. Before writing a custom loop, ask: "Can I use a Counter, set, dict, or heap?" That usually gives a simpler, faster solution.',
    aiAwareness: {
      strongAnswerShouldMention: ['Timsort O(n log n)', 'key= for custom sort', 'bisect for binary search', 'set/dict for O(1) lookup'],
      weakAnswer: 'You can use sorted() to sort a list.',
      likelyFollowUp: ['Sort a list of objects by multiple fields', 'Find k largest elements efficiently', 'Binary search on a sorted list'],
    },
    prerequisites: ['python-lists-dicts-sets'],
    relatedTopics: ['python-frequency-common', 'python-binary-search'],
    references: [
      { title: 'Python Sorting HOW TO', url: 'https://docs.python.org/3/howto/sorting.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-frequency-common',
    technology: T,
    title: 'Duplicate Detection, Frequency Counting & Common Elements',
    category: 'Python Coding',
    slug: 'python-frequency-common',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Use Counter for frequencies, set intersections for common elements, and hash maps to detect duplicates in O(n) time.',
    mentalModel:
      'Frequencies = dict of item → count. Duplicates = seen set. Common elements = intersection of sets.',
    memoryTip:
      'Counter(iterable) for frequencies. set(a) & set(b) for common. len(set) vs len(list) for duplicates. most_common(k) for top-k.',
    keyTerms: ['Counter', 'defaultdict', 'set intersection', 'set union', 'duplicate detection', 'frequency map', 'top-k'],
    interviewAnswer: `**Duplicate detection:**
- Check if list has duplicates: len(items) != len(set(items)) — O(n) time/space.
- Find duplicates: use a Counter and return items with count > 1.
- Find first duplicate: iterate and maintain a seen set; return the first item already in seen.

**Frequency counting:**
- collections.Counter is the idiomatic way: Counter(words).most_common(3) gives top 3.
- For grouped frequencies (e.g., count by category), use defaultdict(list) or defaultdict(int).

**Common elements:**
- set(a).intersection(b) or a & b — O(min(n, m)).
- For common elements with counts (multiset intersection), use Counter: c1 & c2 gives min counts.

**Pattern:** When an interviewer asks "find duplicates", "most frequent", or "intersection", think hash map/set before nested loops.`,
    codeExample: `from collections import Counter, defaultdict

# Find duplicates in a list
def find_duplicates(nums: list[int]) -> list[int]:
    counts = Counter(nums)
    return [num for num, count in counts.items() if count > 1]

# Top-k frequent elements
def top_k_frequent(nums: list[int], k: int) -> list[int]:
    return [num for num, _ in Counter(nums).most_common(k)]

# Common elements preserving order
def common_elements(a: list[int], b: list[int]) -> list[int]:
    set_b = set(b)
    seen = set()
    return [x for x in a if x in set_b and not (x in seen or seen.add(x))]

# Count transactions by currency
transactions = [
    {'amount': 100, 'currency': 'USD'},
    {'amount': 200, 'currency': 'EUR'},
    {'amount': 150, 'currency': 'USD'},
]
counts = defaultdict(int)
for t in transactions:
    counts[t['currency']] += 1

print(counts)  # defaultdict(<class 'int'>, {'USD': 2, 'EUR': 1})`,
    codeLanguage: 'python',
    commonMistakes: [
      'Nested loops for duplicate detection — O(n²) instead of O(n).',
      'Not handling empty inputs or all-unique inputs.',
      'Using list.count() inside a loop — O(n²).',
      'Returning duplicates multiple times if they appear more than twice — use set or Counter items.',
    ],
    seniorInsight: 'In banking, frequency counting applies to transaction monitoring (flag accounts with >10 failed logins), duplicate payment detection (same idempotency key), and audit log analysis. Master Counter + set patterns — they appear constantly.',
    aiAwareness: {
      strongAnswerShouldMention: ['Counter for frequency', 'set for membership/duplicates', 'Counter & for multiset intersection', 'most_common for top-k'],
      weakAnswer: 'Use a for loop to count how many times each item appears.',
      likelyFollowUp: ['Find the first duplicate', 'Find elements that appear exactly twice', 'Find intersection of three lists'],
    },
    prerequisites: ['python-lists-dicts-sets', 'python-sorting-searching'],
    relatedTopics: ['python-hash-maps', 'python-two-pointers'],
    references: [
      { title: 'collections — Counter', url: 'https://docs.python.org/3/library/collections.html#collections.Counter', source: 'python.org', type: 'official' },
    ],
  },
];
