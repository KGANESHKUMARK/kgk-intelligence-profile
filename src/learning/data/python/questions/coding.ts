import type { InterviewQuestion } from '../../../types';

export const pythonCodingQuestions: InterviewQuestion[] = [
  {
    id: 'q-python-deduplicate-order',
    technology: 'python',
    question: 'Remove duplicates from a list while preserving the original order.',
    category: 'Python Coding',
    difficulty: 'beginner',
    quickAnswer: 'Use dict.fromkeys(items) in Python 3.7+, which preserves insertion order and removes duplicates.',
    interviewAnswer: `Approach: iterate through the list and add each item to a set of seen items; if not seen, append to result. In Python 3.7+, dict.fromkeys(items) is the most concise and efficient way because dict preserves insertion order.

Complexity: O(n) time, O(n) extra space for the seen set/dict.

Edge cases: empty list, all duplicates, all unique, unhashable items (use a list comprehension with a custom key or convert to hashable form).`,
    codeExample: `def deduplicate(items: list[int]) -> list[int]:
    return list(dict.fromkeys(items))

# Explicit version for unhashable or custom logic
def deduplicate_explicit(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

# Test cases
assert deduplicate([1, 2, 2, 3, 1]) == [1, 2, 3]
assert deduplicate([]) == []
assert deduplicate([5, 5, 5]) == [5]`,
    keyTerms: ['dict.fromkeys', 'preserve order', 'seen set', 'O(n)'],
    conceptsTested: ['Lists', 'Sets', 'Order preservation'],
    strongAnswerKeywords: ['dict.fromkeys', 'insertion order', 'O(n)', 'set for membership'],
    whatIsBeingTested: ['Basic Python idiom for deduplication'],
    interviewerIntent: 'Tests knowledge of Pythonic patterns and order-preserving deduplication.',
  },

  {
    id: 'q-python-top-k-frequent',
    technology: 'python',
    question: 'Find the top k most frequent elements in a list.',
    category: 'Python Coding',
    difficulty: 'intermediate',
    quickAnswer: 'Use collections.Counter and most_common(k). O(n log k) time.',
    interviewAnswer: `Approach: build a frequency map with Counter, then use Counter.most_common(k) which internally uses a heap to return the k most frequent items.

Complexity: O(n) to build the Counter, O(n log k) for most_common (heap-based). Space O(n) for the frequency map.

Edge cases: k > number of unique elements, k = 0, empty input, ties in frequency (most_common returns arbitrary order among ties).`,
    codeExample: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    return [num for num, _ in Counter(nums).most_common(k)]

# Manual heap version for interviews
import heapq
def top_k_frequent_heap(nums, k):
    counts = Counter(nums)
    return heapq.nlargest(k, counts.keys(), key=counts.get)

assert top_k_frequent([1, 1, 1, 2, 2, 3], 2) == [1, 2]
assert top_k_frequent([], 1) == []`,
    keyTerms: ['Counter', 'most_common', 'heapq.nlargest', 'frequency map'],
    conceptsTested: ['Frequency counting', 'Heaps'],
    strongAnswerKeywords: ['Counter.most_common', 'O(n log k)', 'heapq.nlargest'],
    whatIsBeingTested: ['Frequency counting and top-k selection'],
    interviewerIntent: 'Tests ability to use Counter and understand top-k patterns.',
  },

  {
    id: 'q-python-anagram',
    technology: 'python',
    question: 'Determine if two strings are anagrams of each other.',
    category: 'Python Coding',
    difficulty: 'beginner',
    quickAnswer: 'Compare sorted strings, or compare Counter character counts. Counter is O(n).',
    interviewAnswer: `Approach 1: sorted(s) == sorted(t) — O(n log n) time, O(n) space. Simple but not optimal.
Approach 2: Counter(s) == Counter(t) — O(n) time, O(1) or O(k) space where k is the character set size.

Edge cases: different lengths (instant False), empty strings, case sensitivity, whitespace. Ask the interviewer whether case/whitespace matter.

For Unicode/normalization, mention unicodedata.normalize if relevant.`,
    codeExample: `from collections import Counter

def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    return Counter(s) == Counter(t)

assert is_anagram('listen', 'silent') is True
assert is_anagram('hello', 'world') is False
assert is_anagram('', '') is True`,
    keyTerms: ['Counter', 'sorted comparison', 'hash map', 'anagram'],
    conceptsTested: ['String manipulation', 'Frequency counting'],
    strongAnswerKeywords: ['Counter comparison', 'O(n)', 'length check first'],
    whatIsBeingTested: ['String frequency comparison'],
    interviewerIntent: 'Tests Counter usage and understanding of O(n) vs O(n log n).',
  },

  {
    id: 'q-python-merge-sorted',
    technology: 'python',
    question: 'Merge two sorted lists into one sorted list.',
    category: 'Python Coding',
    difficulty: 'beginner',
    quickAnswer: 'Use two pointers, compare elements, and append the smaller one. O(n + m) time, O(n + m) space.',
    interviewAnswer: `Approach: maintain two pointers, one for each list. At each step, append the smaller element to the result and advance that pointer. When one list is exhausted, append the remainder of the other.

Complexity: O(n + m) time, O(n + m) space for the result.

Edge cases: one or both lists empty, duplicate values across lists, negative numbers.`,
    codeExample: `def merge_sorted(a: list[int], b: list[int]) -> list[int]:
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result

assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]
assert merge_sorted([], [1, 2]) == [1, 2]
assert merge_sorted([1, 1], [1, 2]) == [1, 1, 1, 2]`,
    keyTerms: ['two pointers', 'merge', 'sorted lists', 'O(n+m)'],
    conceptsTested: ['Two pointers', 'Sorting'],
    strongAnswerKeywords: ['two pointers', 'O(n + m)', 'extend remainder'],
    whatIsBeingTested: ['Merging sorted data'],
    interviewerIntent: 'Tests two-pointer technique and in-place thinking.',
  },

  {
    id: 'q-python-reverse-words',
    technology: 'python',
    question: 'Reverse the order of words in a sentence while preserving whitespace between words.',
    category: 'Python Coding',
    difficulty: 'beginner',
    quickAnswer: 'Split on whitespace, reverse the list, join with a single space. For exact whitespace preservation, use regex or manual parsing.',
    interviewAnswer: `Simple version: split() (splits on any whitespace and trims), reverse list, join with ' '. This collapses multiple spaces.

If whitespace must be preserved exactly, use re.findall to capture words and spaces, then reverse the words in place.

Edge cases: leading/trailing spaces, multiple spaces between words, single word, empty string, punctuation attached to words.`,
    codeExample: `def reverse_words_simple(s: str) -> str:
    return ' '.join(s.split()[::-1])

# Preserves exact whitespace
import re
def reverse_words_preserve(s: str) -> str:
    tokens = re.findall(r'\S+|\s+', s)
    words = [t for t in tokens if t.strip()]
    spaces = [t for t in tokens if not t.strip()]
    words.reverse()
    result = []
    wi = si = 0
    while wi < len(words) or si < len(spaces):
        if si < len(spaces) and (wi == 0 or (result and result[-1].strip())):
            result.append(spaces[si]); si += 1
        if wi < len(words):
            result.append(words[wi]); wi += 1
    return ''.join(result)

assert reverse_words_simple('  hello   world  ') == 'world hello'
assert reverse_words_preserve('  hello   world  ') == '  world   hello  '`,
    keyTerms: ['split', 'join', 'reverse', 'regex tokenization'],
    conceptsTested: ['String manipulation'],
    strongAnswerKeywords: ['split and reverse', 'whitespace preservation with regex', 'edge cases'],
    whatIsBeingTested: ['String parsing and edge-case handling'],
    interviewerIntent: 'Tests whether candidate clarifies whitespace requirements before coding.',
  },
];
