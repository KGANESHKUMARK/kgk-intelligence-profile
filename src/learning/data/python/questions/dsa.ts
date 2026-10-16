import type { InterviewQuestion } from '../../../types';

export const pythonDsaQuestions: InterviewQuestion[] = [
  {
    id: 'q-python-two-sum',
    technology: 'python',
    question: 'Two Sum: given an array of integers and a target, return indices of two numbers that add up to the target.',
    category: 'Data Structures & Algorithms',
    difficulty: 'beginner',
    quickAnswer: 'Use a hash map: for each number, check if complement exists in seen dict. O(n) time, O(n) space.',
    interviewAnswer: `Approach: single pass through the array. For each number, compute complement = target - num. If complement is in the seen dict, return its index and current index. Otherwise store num and its index.

Why hash map and not two pointers? The input is not sorted, so two pointers after sorting would lose original indices. Hash map gives O(n).

Complexity: O(n) time, O(n) space.

Edge cases: no solution (return None or raise), duplicate numbers used twice (e.g., [3,3] target 6), negative numbers, empty array.`,
    codeExample: `def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return (seen[complement], i)
        seen[num] = i
    return None

assert two_sum([2, 7, 11, 15], 9) == (0, 1)
assert two_sum([3, 3], 6) == (0, 1)
assert two_sum([1, 2, 3], 10) is None`,
    keyTerms: ['hash map', 'complement', 'single pass', 'O(n)'],
    conceptsTested: ['Hash maps'],
    strongAnswerKeywords: ['hash map', 'complement', 'single pass', 'O(n)'],
    whatIsBeingTested: ['Recognizing hash-map pattern'],
    interviewerIntent: 'Classic hash-map pattern recognition question.',
  },

  {
    id: 'q-python-valid-parentheses',
    technology: 'python',
    question: 'Valid Parentheses: determine if a string of brackets is balanced.',
    category: 'Data Structures & Algorithms',
    difficulty: 'beginner',
    quickAnswer: 'Use a stack. Push opening brackets, pop and match closing brackets. O(n) time, O(n) space.',
    interviewAnswer: `Approach: iterate through characters. Push opening brackets onto a stack. For a closing bracket, pop the stack and check if it matches. If mismatch or stack empty when encountering a closing bracket, return False. At the end, return stack == empty.

Complexity: O(n) time, O(n) space for the stack.

Edge cases: empty string (True), single bracket (False), only opening brackets, only closing brackets, mismatched types ([{]), large strings.`,
    codeExample: `def is_valid(s: str) -> bool:
    stack: list[str] = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for char in s:
        if char in pairs:
            stack.append(char)
        elif not stack or pairs[stack.pop()] != char:
            return False
    return not stack

assert is_valid('()') is True
assert is_valid('()[]{}') is True
assert is_valid('(]') is False
assert is_valid('(') is False`,
    keyTerms: ['stack', 'LIFO', 'balanced brackets', 'O(n)'],
    conceptsTested: ['Stacks'],
    strongAnswerKeywords: ['stack', 'opening push', 'closing pop and match', 'O(n)'],
    whatIsBeingTested: ['Stack usage'],
    interviewerIntent: 'Tests stack basics and bracket matching logic.',
  },

  {
    id: 'q-python-binary-search-target',
    technology: 'python',
    question: 'Implement binary search to find the index of a target in a sorted array, or -1 if not present.',
    category: 'Data Structures & Algorithms',
    difficulty: 'beginner',
    quickAnswer: 'Maintain left/right pointers, compute mid, compare target to mid, halve the search space. O(log n).',
    interviewAnswer: `Approach: initialize left = 0, right = len(arr) - 1. While left <= right, compute mid. If arr[mid] == target, return mid. If target < arr[mid], set right = mid - 1; else left = mid + 1. Return -1 if not found.

Use bisect_left in real code; the interview asks for the implementation to test understanding.

Complexity: O(log n) time, O(1) space.

Edge cases: empty array, target at boundaries, target not present, duplicate target (returns any index; use bisect for first/last).`,
    codeExample: `def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if target < arr[mid]:
            right = mid - 1
        else:
            left = mid + 1
    return -1

assert binary_search([1, 3, 5, 7, 9], 5) == 2
assert binary_search([1, 3, 5, 7, 9], 10) == -1
assert binary_search([], 1) == -1`,
    keyTerms: ['binary search', 'left/right pointers', 'mid', 'O(log n)'],
    conceptsTested: ['Binary search'],
    strongAnswerKeywords: ['left <= right', 'mid calculation', 'halving search space', 'O(log n)'],
    whatIsBeingTested: ['Binary search implementation'],
    interviewerIntent: 'Tests careful pointer updates and loop conditions.',
  },

  {
    id: 'q-python-max-depth-tree',
    technology: 'python',
    question: 'Find the maximum depth of a binary tree.',
    category: 'Data Structures & Algorithms',
    difficulty: 'beginner',
    quickAnswer: 'Recursion: max depth = 1 + max(depth(left), depth(right)). Base case: empty node returns 0.',
    interviewAnswer: `Approach: recursively compute depth. For each node, the depth is 1 plus the maximum depth of its left and right subtrees. An empty node contributes 0.

Iterative alternative: BFS level-order traversal, counting levels.

Complexity: O(n) time (visit each node once), O(h) recursion stack space where h is height. Worst case O(n) for skewed tree.

Edge cases: empty tree (0), single node (1), skewed tree (n), very deep tree (consider iterative to avoid recursion limit).`,
    codeExample: `from collections import deque
from typing import Optional

class TreeNode:
    def __init__(self, val: int = 0, left: Optional['TreeNode'] = None, right: Optional['TreeNode'] = None):
        self.val = val
        self.left = left
        self.right = right

def max_depth(root: Optional[TreeNode]) -> int:
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# Iterative BFS version
def max_depth_bfs(root: Optional[TreeNode]) -> int:
    if not root:
        return 0
    depth = 0
    queue = deque([root])
    while queue:
        depth += 1
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth`,
    keyTerms: ['recursion', 'BFS', 'tree depth', 'base case'],
    conceptsTested: ['Trees'],
    strongAnswerKeywords: ['recursive 1 + max', 'BFS alternative', 'O(n) time', 'empty node base case'],
    whatIsBeingTested: ['Tree traversal'],
    interviewerIntent: 'Tests recursion and tree base cases.',
  },

  {
    id: 'q-python-longest-substring',
    technology: 'python',
    question: 'Longest Substring Without Repeating Characters.',
    category: 'Data Structures & Algorithms',
    difficulty: 'intermediate',
    quickAnswer: 'Sliding window with a dict storing the last index of each character. Expand right, contract left past the last duplicate. O(n).',
    interviewAnswer: `Approach: sliding window. Maintain left boundary and a dict of character -> last seen index. For each right character, if it was seen inside the current window (index >= left), move left to index + 1 to exclude the duplicate. Update the character's index and track max window size.

Complexity: O(n) time, O(min(n, k)) space where k is the character set size.

Edge cases: empty string (0), all unique (length), all same character (1), mixed duplicates.`,
    codeExample: `def length_of_longest_substring(s: str) -> int:
    char_index: dict[str, int] = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

assert length_of_longest_substring('abcabcbb') == 3
assert length_of_longest_substring('bbbbb') == 1
assert length_of_longest_substring('pwwkew') == 3`,
    keyTerms: ['sliding window', 'hash map', 'two pointers', 'O(n)'],
    conceptsTested: ['Sliding window', 'Hash maps'],
    strongAnswerKeywords: ['sliding window', 'char last index', 'contract left', 'O(n)'],
    whatIsBeingTested: ['Sliding window pattern'],
    interviewerIntent: 'Tests sliding window and pointer management.',
  },
];
