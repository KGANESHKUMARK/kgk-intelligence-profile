import type { LearningTopic } from '../../../types';

const T = 'python';

export const pythonDsaTopics: LearningTopic[] = [
  {
    id: 'python-hash-maps',
    technology: T,
    title: 'Hash Maps & When to Use Them',
    category: 'Data Structures & Algorithms',
    slug: 'python-hash-maps',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A hash map stores key-value pairs. Average O(1) lookup/insert/delete. The right default for "have I seen this?", "count this", and "group by this" problems.',
    mentalModel:
      'Hash map = array + hash function. The hash converts the key to an index. Collisions are handled internally (open addressing in CPython dict).',
    memoryTip:
      'dict = hash map. Use it for: seen, counts, indexes, groups. Average O(1) lookup. Keys must be hashable.',
    keyTerms: ['hash map', 'hashable', 'collision', 'open addressing', 'load factor', 'rehashing', 'defaultdict', 'Counter'],
    interviewAnswer: `A **hash map** (Python dict) maps keys to values via a hash function. Hashing converts a key into an array index, making lookups, insertions, and deletions average O(1).

**When to use a hash map:**
- Frequency/counting problems (Counter).
- Duplicate detection ("have I seen this value?").
- Fast lookup by a key (user by email, account by ID).
- Grouping (group transactions by account).
- Complement problems (e.g., two-sum: for each x, check if target - x exists).

**Keys must be hashable:**
Immutable types are hashable: int, str, tuple, frozenset. Mutable types (list, dict, set) are NOT hashable because their contents can change, breaking the hash contract.

**Trade-offs:**
- O(1) average, but O(n) worst case if many hash collisions (rare with good hash function).
- Uses more memory than a list.
- Does not maintain meaningful order beyond insertion order (Python 3.7+).

**Pythonic tools:** dict, collections.defaultdict, collections.Counter, dict.get(key, default).`,
    codeExample: `# Two-sum with hash map — O(n)
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return (seen[complement], i)
        seen[num] = i
    return None

# Group by account
transactions = [
    {'id': 't1', 'account': 'A'},
    {'id': 't2', 'account': 'B'},
    {'id': 't3', 'account': 'A'},
]
groups: dict[str, list[dict]] = {}
for t in transactions:
    groups.setdefault(t['account'], []).append(t)

# Or with defaultdict
from collections import defaultdict
groups = defaultdict(list)
for t in transactions:
    groups[t['account']].append(t)

print(groups['A'])  # [{'id': 't1', 'account': 'A'}, {'id': 't3', 'account': 'A'}]`,
    codeLanguage: 'python',
    commonMistakes: [
      'Not initializing dict values — use setdefault or defaultdict to avoid KeyError.',
      'Using a list for membership/lookup on large data.',
      'Trying to hash a list or dict as a key.',
      'Assuming worst-case O(1) — mention average case and collisions.',
    ],
    seniorInsight: 'Most "easy" LeetCode problems are solved by recognizing a hash-map pattern. Before optimizing further, ask: "Can I use a dict to make this O(n)?" That alone solves two-sum, anagrams, intersection, and many others.',
    aiAwareness: {
      strongAnswerShouldMention: ['average O(1)', 'hashable keys', 'Counter/defaultdict', 'two-sum pattern', 'grouping'],
      weakAnswer: 'A dictionary lets you look up values by key.',
      likelyFollowUp: ['Why must dict keys be hashable?', 'What causes hash collisions?', 'Implement a simple hash map'],
    },
    relatedTopics: ['python-frequency-common', 'python-stacks-queues'],
    references: [
      { title: 'Python dict internals', url: 'https://docs.python.org/3/library/stdtypes.html#mapping-types-dict', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-stacks-queues',
    technology: T,
    title: 'Stacks, Queues & Deques',
    category: 'Data Structures & Algorithms',
    slug: 'python-stacks-queues',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Stack = LIFO (append/pop from end). Queue = FIFO (use collections.deque). Deque supports efficient append/pop from both ends.',
    mentalModel:
      'Stack = stack of plates. Queue = line at the bank. Deque = double-ended queue for both behaviors plus sliding window tricks.',
    memoryTip:
      'stack: list.append + list.pop. queue/deque: collections.deque.append + deque.popleft. NEVER use list.pop(0) for queues — O(n).',
    keyTerms: ['stack', 'queue', 'deque', 'LIFO', 'FIFO', 'collections.deque', 'append', 'popleft', 'monotonic stack'],
    interviewAnswer: `**Stack (LIFO):** Use a list. push = append(item), pop = item = stack.pop(), peek = stack[-1]. Used for: balanced parentheses, undo/redo, DFS, expression evaluation, monotonic stack for next greater element.

**Queue (FIFO):** Use collections.deque. enqueue = deque.append(item), dequeue = item = deque.popleft(), peek = deque[0].

**Why not list for queues?**
list.pop(0) and list.insert(0, item) are O(n) because all other elements must shift. deque.popleft() is O(1).

**Deque:**
Double-ended queue. append/appendleft, pop/popleft are all O(1). Useful for sliding windows, BFS, palindrome checks, and implementing a bounded queue.

**Monotonic stack:** Maintains increasing or decreasing order. Used for "next greater element" and "largest rectangle in histogram" problems.`,
    codeExample: `from collections import deque

# Stack: valid parentheses
def is_valid(s: str) -> bool:
    stack: list[str] = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for char in s:
        if char in pairs:
            stack.append(char)
        elif not stack or pairs[stack.pop()] != char:
            return False
    return not stack

# Queue: BFS-like task processing
tasks = deque(['task1', 'task2', 'task3'])
while tasks:
    current = tasks.popleft()
    print(f'Processing {current}')

# Monotonic stack: next greater element
def next_greater(nums: list[int]) -> list[int | None]:
    result: list[int | None] = [None] * len(nums)
    stack: list[int] = []  # stores indices
    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] < num:
            idx = stack.pop()
            result[idx] = num
        stack.append(i)
    return result

print(next_greater([2, 1, 2, 4, 3]))  # [4, 2, 4, None, None]`,
    codeLanguage: 'python',
    commonMistakes: [
      'Using list.pop(0) as a queue — O(n) per operation.',
      'Not checking if stack is empty before popping — IndexError.',
      'Using deque for random access by index — O(n), unlike list O(1).',
      'Confusing stack peek (stack[-1]) with pop.',
    ],
    seniorInsight: 'In banking: queues model job/task processing (payment settlement queue), stacks model undo/redo in forms, and deques model sliding-window fraud detection (transactions in the last 5 minutes). Always know which end you operate on.',
    aiAwareness: {
      strongAnswerShouldMention: ['list for stack O(1)', 'deque for queue O(1)', 'never pop(0)', 'monotonic stack', 'LIFO/FIFO'],
      weakAnswer: 'Stacks go in and out in reverse, queues in order.',
      likelyFollowUp: ['Implement a queue using two stacks', 'Next greater element', 'Check balanced parentheses'],
    },
    prerequisites: ['python-lists-dicts-sets'],
    relatedTopics: ['python-hash-maps', 'python-binary-search'],
    references: [
      { title: 'collections.deque', url: 'https://docs.python.org/3/library/collections.html#collections.deque', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-two-pointers',
    technology: T,
    title: 'Two Pointers & Sliding Window',
    category: 'Data Structures & Algorithms',
    slug: 'python-two-pointers',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Two pointers traverse the array from both ends or with a fixed gap. Great for sorted arrays, palindromes, and finding pairs. Sliding window extends this for subarrays.',
    mentalModel:
      'Two pointers are like two fingers walking along a line. They move toward each other, or one chases the other, to find a condition.',
    memoryTip:
      'Sorted arrays → two pointers from ends. Subarray problems → sliding window (expand right, contract left). Fast/slow pointers for cycles.',
    keyTerms: ['two pointers', 'sliding window', 'left/right pointers', 'fast/slow pointers', 'subarray', 'palindrome'],
    interviewAnswer: `**Two pointers from ends:**
Used on sorted arrays. left = 0, right = len - 1. Move pointers inward based on the sum/condition. Example: two-sum on sorted array, 3-sum, container with most water.

**Sliding window:**
Expand right pointer to grow the window, then contract left pointer when the window violates a constraint. Used for: longest substring without repeating chars, smallest subarray with sum ≥ target, max sum subarray of size k.

**Fast/slow pointers:**
Detect cycles in linked lists or sequences (Floyd's cycle detection).

**When NOT to use two pointers:**
If the data is unsorted and sorting is expensive or not allowed, use a hash map instead (e.g., two-sum on unsorted array is better with dict).

**Complexity:** Most two-pointer solutions are O(n) time and O(1) extra space — highly efficient.`,
    codeExample: `# Two-sum on sorted array — O(n)
def two_sum_sorted(nums: list[int], target: int) -> tuple[int, int] | None:
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return (left, right)
        if s < target:
            left += 1
        else:
            right -= 1
    return None

# Longest substring without repeating characters — sliding window
def length_of_longest_substring(s: str) -> int:
    char_index: dict[str, int] = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

print(length_of_longest_substring('abcabcbb'))  # 3 ('abc')`,
    codeLanguage: 'python',
    commonMistakes: [
      'Forgetting to handle the case where pointers meet/cross.',
      'Using two pointers on unsorted data when a hash map would be simpler.',
      'Not updating the sliding window left pointer correctly on duplicate characters.',
      'Off-by-one errors in window size calculation (right - left + 1).',
    ],
    seniorInsight: 'Two pointers are common in interview questions because they demonstrate the ability to avoid O(n²) brute force. The key signal is "sorted array" or "find a subarray/substring." State the O(n)/O(1) complexity explicitly — interviewers love that.',
    aiAwareness: {
      strongAnswerShouldMention: ['sorted array → two pointers', 'subarray → sliding window', 'O(n) time O(1) space', 'cycle → fast/slow'],
      weakAnswer: 'Use two loops to compare every pair.',
      likelyFollowUp: ['3-sum', 'Container with most water', 'Longest substring without repeats', 'Detect cycle in linked list'],
    },
    prerequisites: ['python-sorting-searching', 'python-hash-maps'],
    relatedTopics: ['python-binary-search', 'python-trees'],
    references: [
      { title: 'LeetCode — Two Pointers Pattern', url: 'https://leetcode.com/tag/two-pointers/', source: 'leetcode.com', type: 'article' },
    ],
  },

  {
    id: 'python-binary-search',
    technology: T,
    title: 'Binary Search',
    category: 'Data Structures & Algorithms',
    slug: 'python-binary-search',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Binary search halves the search space each step. Requires sorted data. O(log n). Useful beyond finding an exact target: finding boundaries and insertion points.',
    mentalModel:
      'Guess a number between 1 and 100. Always guess the middle, then eliminate half. That is binary search.',
    memoryTip:
      'left=0, right=len-1. while left <= right: mid=(left+right)//2. Compare target to mid, move the correct pointer. Use bisect in Python.',
    keyTerms: ['binary search', 'bisect_left', 'bisect_right', 'search space', 'lower bound', 'upper bound', 'O(log n)'],
    interviewAnswer: `**Basic binary search:**
Given a sorted array, find if target exists. Repeatedly compare target to the middle element; if target is smaller, search the left half; if larger, search the right half. O(log n) time, O(1) space.

**Variants (very common in interviews):**
- Find first occurrence of target (lower bound).
- Find last occurrence (upper bound - 1).
- Find the insertion point (bisect_left).
- Find peak element (binary search on unimodal array).
- Search rotated sorted array (one half is always sorted).
- Binary search on answer (find minimum feasible value).

**Python's bisect module:**
bisect_left(a, x) returns the insertion point such that all elements before are < x. bisect_right(a, x) returns insertion point such that all before are ≤ x.

**Why binary search is tricky:**
The off-by-one errors in loop conditions (left <= right vs left < right) and pointer updates (mid + 1 or mid - 1) cause infinite loops or missed elements. Memorize the "left = 0, right = len(arr) - 1, while left <= right" template.`,
    codeExample: `from bisect import bisect_left, bisect_right

# Template binary search
def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Lower/upper bounds
nums = [1, 2, 2, 2, 3, 4]
print(bisect_left(nums, 2))   # 1 (first index where 2 can be inserted)
print(bisect_right(nums, 2))  # 4 (last index where 2 can be inserted)
print(bisect_right(nums, 2) - bisect_left(nums, 2))  # 3 occurrences

# Binary search on rotated sorted array
def search_rotated(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[left] <= arr[mid]:  # left half sorted
            if arr[left] <= target < arr[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:  # right half sorted
            if arr[mid] < target <= arr[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
    codeLanguage: 'python',
    commonMistakes: [
      'Off-by-one in loop condition (using < instead of <=).',
      'Infinite loop from not updating pointers to mid ± 1.',
      'Applying binary search to unsorted data.',
      'Not handling empty array.',
    ],
    seniorInsight: 'Binary search appears not just in arrays but in "find minimum feasible X" problems. If you can define a predicate function is_feasible(x) that is False...True, binary search on the answer. Recognizing this pattern separates good candidates from great ones.',
    aiAwareness: {
      strongAnswerShouldMention: ['O(log n)', 'sorted data required', 'bisect for boundaries', 'variants: first/last/insertion', 'rotated array'],
      weakAnswer: 'Binary search finds an element in a sorted list.',
      likelyFollowUp: ['Find first and last occurrence', 'Search rotated sorted array', 'Find peak element', 'Binary search on answer'],
    },
    prerequisites: ['python-sorting-searching'],
    relatedTopics: ['python-two-pointers', 'python-trees'],
    references: [
      { title: 'bisect — Array Bisection', url: 'https://docs.python.org/3/library/bisect.html', source: 'python.org', type: 'official' },
    ],
  },

  {
    id: 'python-trees',
    technology: T,
    title: 'Basic Trees & Binary Search Trees',
    category: 'Data Structures & Algorithms',
    slug: 'python-trees',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Trees model hierarchical data. Binary Search Tree (BST) enables O(h) lookups. Traversals: in-order, pre-order, post-order, level-order (BFS).',
    mentalModel:
      'A tree is a node with children. BST = left smaller, right larger. In-order traversal of BST gives sorted values.',
    memoryTip:
      'class TreeNode: val, left, right. BST search: smaller go left, larger go right. In-order = sorted. BFS = queue. DFS = stack/recursion.',
    keyTerms: ['binary tree', 'BST', 'traversal', 'in-order', 'pre-order', 'post-order', 'level-order', 'height', 'balanced BST'],
    interviewAnswer: `**Tree basics:**
A tree node contains data and references to children. A binary tree has at most two children. A Binary Search Tree (BST) maintains the invariant: all left descendants ≤ node ≤ all right descendants (for a valid BST).

**Traversals:**
- In-order (left, node, right): yields sorted values for BST.
- Pre-order (node, left, right): useful for cloning trees or prefix expressions.
- Post-order (left, right, node): useful for deletion, evaluating expression trees.
- Level-order (BFS): visit nodes level by level using a queue.

**BST operations:**
Search/insert/delete: O(h) where h is height. In a balanced BST, h = log n. In a skewed BST, h = n (worst case). Self-balancing trees (AVL, Red-Black) keep h = log n.

**Common tree interview patterns:**
- Recursion on subtrees (max depth, diameter, path sum).
- DFS for all paths/solutions.
- BFS for level-by-level processing.
- BST validation: in-order traversal must be sorted.`,
    codeExample: `from collections import deque
from typing import Optional

class TreeNode:
    def __init__(self, val: int = 0, left: Optional['TreeNode'] = None, right: Optional['TreeNode'] = None):
        self.val = val
        self.left = left
        self.right = right

# In-order traversal (iterative with stack)
def inorder(root: Optional[TreeNode]) -> list[int]:
    result: list[int] = []
    stack: list[TreeNode] = []
    current = root
    while current or stack:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        result.append(current.val)
        current = current.right
    return result

# Level-order traversal (BFS)
def level_order(root: Optional[TreeNode]) -> list[list[int]]:
    if not root:
        return []
    result: list[list[int]] = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result

# BST search
def search_bst(root: Optional[TreeNode], target: int) -> Optional[TreeNode]:
    while root and root.val != target:
        root = root.left if target < root.val else root.right
    return root`,
    codeLanguage: 'python',
    commonMistakes: [
      'Confusing tree height and depth — height from leaf to node, depth from root.',
      'Not handling the empty tree (root is None) base case.',
      'Using recursion without considering recursion depth limits on very deep trees.',
      'Assuming a binary tree is a BST without checking the invariant.',
    ],
    seniorInsight: 'In production, Python recursion depth is limited (~1000 by default). For very deep trees, prefer iterative solutions. In banking, trees model org hierarchies, decision trees, and file systems. BSTs are rarely implemented from scratch — you use sortedcontainers or database indexes.',
    aiAwareness: {
      strongAnswerShouldMention: ['BST invariant', 'in-order = sorted', 'BFS uses queue', 'DFS uses stack/recursion', 'O(h) operations'],
      weakAnswer: 'A tree has nodes connected by edges.',
      likelyFollowUp: ['Validate BST', 'Lowest common ancestor', 'Maximum depth', 'Serialize/deserialize binary tree'],
    },
    prerequisites: ['python-stacks-queues', 'python-binary-search'],
    relatedTopics: ['python-hash-maps'],
    references: [
      { title: 'Problem Solving with Algorithms and Data Structures — Trees', url: 'https://runestone.academy/ns/books/published/pythonds/Trees/toctree.html', source: 'runestone.academy', type: 'article' },
    ],
  },
];
