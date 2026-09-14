import type { AlgorithmId } from "@/algorithms/types";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** index into `options` */
  answer: number;
  explanation: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  /** Minutes of estimated reading + practice */
  minutes: number;
  xpReward: number;
  algorithm?: AlgorithmId;
  /** Short paragraphs of lesson content */
  lesson: string[];
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export const PASS_RATIO = 0.6;

export const levels: Level[] = [
  {
    id: 1,
    title: "What sorting really is",
    subtitle: "Order, keys, comparisons and why it matters",
    minutes: 6,
    xpReward: 80,
    lesson: [
      "Sorting means rearranging a collection so its elements follow a defined order — ascending or descending — according to a key. The key is whatever value you compare: a number, a surname, a timestamp.",
      "Almost every comparison sort is built from two primitive operations: comparing two elements, and moving an element to a different position. Counting those two operations is how we measure cost, independently of how fast your laptop happens to be.",
      "We describe that cost with Big-O notation, which keeps only the dominant term as the input grows. An algorithm that performs 3n² + 5n + 12 comparisons is simply O(n²): for large n the quadratic term drowns out everything else.",
      "Sorted data unlocks faster algorithms elsewhere — binary search, duplicate detection, merging, grouping and median finding all assume order. That is why sorting is the first serious algorithm most courses teach.",
    ],
    keyPoints: [
      "A comparison sort only ever asks: 'does a come before b?'",
      "Cost is measured in comparisons and moves, not seconds",
      "Big-O keeps the dominant term as n grows",
      "Sorting is a building block for search and grouping",
    ],
    quiz: [
      {
        id: "l1q1",
        prompt: "Which two primitive operations do comparison sorts count?",
        options: [
          "Additions and multiplications",
          "Comparisons and element moves",
          "Memory allocations and frees",
          "Reads and network calls",
        ],
        answer: 1,
        explanation:
          "Comparison sorts are analysed by how many comparisons they make and how many times they move data.",
      },
      {
        id: "l1q2",
        prompt: "An algorithm performs 4n² + 100n + 9 comparisons. Its complexity is:",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(4n²)"],
        answer: 2,
        explanation:
          "Big-O drops constants and lower-order terms, leaving the dominant n² term.",
      },
      {
        id: "l1q3",
        prompt: "Why does sorting data first often speed up later work?",
        options: [
          "Sorted arrays use less memory",
          "Sorted data enables binary search and easy grouping",
          "Sorting compresses the data",
          "CPUs skip sorted arrays",
        ],
        answer: 1,
        explanation:
          "Order is a precondition for binary search, merging and many grouping techniques.",
      },
    ],
  },
  {
    id: 2,
    title: "Bubble Sort",
    subtitle: "Adjacent swaps and the early-exit optimisation",
    minutes: 8,
    xpReward: 100,
    algorithm: "bubble",
    lesson: [
      "Bubble sort repeatedly walks the array comparing each neighbouring pair and swapping them when they are out of order. After the first pass the largest value has 'bubbled' all the way to the end, so the next pass can stop one position earlier.",
      "Every pass locks exactly one more element into place at the right-hand end, so at most n − 1 passes are required. That gives n(n−1)/2 comparisons in the worst case — O(n²).",
      "The classic optimisation is a `swapped` flag. If a full pass completes without a single swap, the array must already be sorted and we can exit immediately. On already-sorted input this reduces the cost to a single pass: O(n).",
      "Because bubble sort only swaps strictly out-of-order neighbours, equal elements never jump over each other — bubble sort is stable. It also sorts inside the original array, so it is in-place with O(1) extra space.",
    ],
    keyPoints: [
      "Each pass pushes the next largest value to the end",
      "Worst and average case O(n²); best case O(n) with the swapped flag",
      "Stable and in-place",
      "Great for teaching, poor for production",
    ],
    quiz: [
      {
        id: "l2q1",
        prompt: "After the first complete pass of bubble sort (ascending), what is guaranteed?",
        options: [
          "The smallest element is at index 0",
          "The largest element is at the last index",
          "The array is half sorted",
          "Nothing is guaranteed",
        ],
        answer: 1,
        explanation:
          "The largest value is repeatedly swapped rightwards until it reaches the final position.",
      },
      {
        id: "l2q2",
        prompt: "What is bubble sort's best-case complexity with the early-exit flag?",
        options: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
        answer: 1,
        explanation:
          "On already-sorted input one pass makes no swaps, so the algorithm stops after n − 1 comparisons.",
      },
      {
        id: "l2q3",
        prompt: "Bubble sort is stable because…",
        options: [
          "It uses extra memory to preserve order",
          "It only swaps strictly out-of-order neighbours, so equal items never cross",
          "It sorts from both ends at once",
          "It never swaps at all",
        ],
        answer: 1,
        explanation:
          "Using a strict > comparison means equal elements are left in their original relative order.",
      },
      {
        id: "l2q4",
        prompt: "How many comparisons does bubble sort make in the worst case for n = 5?",
        options: ["5", "10", "20", "25"],
        answer: 1,
        explanation: "n(n−1)/2 = 5 × 4 / 2 = 10 comparisons.",
      },
    ],
  },
  {
    id: 3,
    title: "Selection Sort",
    subtitle: "Minimise the number of writes",
    minutes: 7,
    xpReward: 100,
    algorithm: "selection",
    lesson: [
      "Selection sort divides the array into a sorted prefix and an unsorted suffix. Each pass scans the entire unsorted region looking for the smallest value, then swaps it into the first unsorted slot.",
      "The scan always examines every remaining element, so the comparison count is fixed at n(n−1)/2 regardless of the input. Selection sort has no best case — sorted input costs exactly the same as reversed input.",
      "Its redeeming feature is write count: at most n − 1 swaps happen in total. When writing is expensive — flash memory, for instance — that matters more than comparisons.",
      "The long-distance swap is also what makes selection sort unstable: moving a distant minimum into place can jump it over an equal value and reverse their original order.",
    ],
    keyPoints: [
      "Always Θ(n²) comparisons — best = average = worst",
      "At most n − 1 swaps, the fewest of any simple sort",
      "Unstable because of long-distance swaps",
      "In-place, O(1) extra space",
    ],
    quiz: [
      {
        id: "l3q1",
        prompt: "Why does selection sort have no better best case?",
        options: [
          "It shuffles the array first",
          "It always scans the entire unsorted region to find the minimum",
          "It uses recursion",
          "It compares every pair twice",
        ],
        answer: 1,
        explanation:
          "The inner scan cannot stop early — the minimum could be the very last element.",
      },
      {
        id: "l3q2",
        prompt: "What is the maximum number of swaps selection sort performs on n elements?",
        options: ["n − 1", "n log n", "n²/2", "n²"],
        answer: 0,
        explanation: "One swap per pass, and there are n − 1 passes.",
      },
      {
        id: "l3q3",
        prompt: "When is selection sort a reasonable choice?",
        options: [
          "When the data is already nearly sorted",
          "When writes are far more expensive than comparisons",
          "When stability is required",
          "When n is very large",
        ],
        answer: 1,
        explanation:
          "Its minimal write count suits memory where writing is costly or wears the device.",
      },
    ],
  },
  {
    id: 4,
    title: "Insertion Sort",
    subtitle: "The card-player's algorithm",
    minutes: 8,
    xpReward: 100,
    algorithm: "insertion",
    lesson: [
      "Insertion sort grows a sorted prefix one element at a time. It lifts the next element out as the 'key', shifts every larger element of the prefix one slot right, and drops the key into the gap — exactly how most people sort a hand of cards.",
      "On nearly sorted data the inner while-loop exits almost immediately, so the algorithm costs O(n). This makes insertion sort the fastest simple sort for small or almost-ordered inputs.",
      "On reversed input every element must travel the whole way to the front, giving n(n−1)/2 shifts — O(n²).",
      "It is stable, in-place, and adaptive. Real libraries use it as the base case of quick sort and merge sort: below roughly 16 elements it beats the fancier algorithms because it has almost no overhead.",
    ],
    keyPoints: [
      "Best case O(n) on nearly sorted data — it is adaptive",
      "Worst case O(n²) on reversed data",
      "Stable and in-place",
      "Used as the base case inside real hybrid sorts",
    ],
    quiz: [
      {
        id: "l4q1",
        prompt: "Insertion sort is called 'adaptive' because…",
        options: [
          "It changes algorithm halfway",
          "Its running time improves when the input is already partly ordered",
          "It adapts the array size",
          "It picks a random pivot",
        ],
        answer: 1,
        explanation:
          "Fewer inversions means fewer shifts, so nearly sorted input approaches O(n).",
      },
      {
        id: "l4q2",
        prompt: "In the shifting loop, what happens to elements larger than the key?",
        options: [
          "They are deleted",
          "They are swapped with the key one at a time",
          "They are copied one position to the right",
          "They are moved to a temporary array",
        ],
        answer: 2,
        explanation:
          "Insertion sort shifts (copies) larger elements right, then writes the key once — cheaper than repeated swaps.",
      },
      {
        id: "l4q3",
        prompt: "Why do production sorts fall back to insertion sort on small sub-arrays?",
        options: [
          "It is the only stable sort",
          "Its constant factors and overhead are tiny for small n",
          "It needs no comparisons",
          "It works without memory",
        ],
        answer: 1,
        explanation:
          "Asymptotics only dominate for large n; for small n the low overhead of insertion sort wins.",
      },
    ],
  },
  {
    id: 5,
    title: "Comparing the quadratic sorts",
    subtitle: "Stability, adaptivity and choosing between them",
    minutes: 7,
    xpReward: 120,
    lesson: [
      "Bubble, selection and insertion sort all run in O(n²) on average, yet they behave very differently. Use the comparison page to race them on the same array and watch the counters diverge.",
      "Bubble sort makes the most swaps: every inversion costs a swap. Insertion sort makes the same number of moves but implements them as cheaper shifts. Selection sort makes the fewest writes but never fewer comparisons.",
      "Stability decides whether equal elements keep their original relative order. Bubble and insertion sort are stable; selection sort is not, because it swaps across long distances.",
      "Adaptivity decides whether existing order helps. Bubble (with the flag) and insertion sort are adaptive; selection sort is not. In practice, insertion sort is the best of the three for real data.",
    ],
    keyPoints: [
      "Same Big-O, very different constants and behaviour",
      "Stable: bubble, insertion — Unstable: selection",
      "Adaptive: bubble (flag), insertion — Not adaptive: selection",
      "Selection sort minimises writes; insertion sort minimises real-world time",
    ],
    quiz: [
      {
        id: "l5q1",
        prompt: "Which of the three simple sorts is NOT stable?",
        options: ["Bubble sort", "Insertion sort", "Selection sort", "All are stable"],
        answer: 2,
        explanation:
          "Selection sort's long-distance swap can move an element past an equal one.",
      },
      {
        id: "l5q2",
        prompt: "You must sort 40 records on a device where each write wears out the memory. Which do you choose?",
        options: ["Bubble sort", "Selection sort", "Insertion sort", "Any of them"],
        answer: 1,
        explanation: "Selection sort performs at most n − 1 writes of array elements.",
      },
      {
        id: "l5q3",
        prompt: "Your data arrives almost sorted apart from a few late entries. Best choice?",
        options: ["Selection sort", "Insertion sort", "Bubble sort without the flag", "None"],
        answer: 1,
        explanation:
          "Insertion sort is adaptive: few inversions means close to linear time.",
      },
    ],
  },
  {
    id: 6,
    title: "Divide and conquer: Merge Sort",
    subtitle: "Guaranteed O(n log n) at the cost of memory",
    minutes: 10,
    xpReward: 140,
    algorithm: "merge",
    lesson: [
      "Merge sort splits the array in half, sorts each half recursively, and merges the two sorted halves back together. The recursion bottoms out at single elements, which are trivially sorted.",
      "Merging two sorted lists of total length n takes exactly n writes and at most n − 1 comparisons: repeatedly take the smaller front element. Because the recursion has log₂ n levels and each level merges n elements, the total cost is Θ(n log n) — in the best, average and worst case alike.",
      "The price is memory. The standard merge copies the halves into temporary arrays, so merge sort needs O(n) auxiliary space and is not in-place.",
      "Merge sort is stable when the merge prefers the left half on ties, which is why Java's `Arrays.sort` for objects uses a merge-sort variant (TimSort) — stability matters when sorting records by multiple keys.",
    ],
    keyPoints: [
      "Θ(n log n) in every case — no bad inputs",
      "Needs O(n) auxiliary memory",
      "Stable when ties prefer the left half",
      "Basis of TimSort, used for objects in Java and Python",
    ],
    quiz: [
      {
        id: "l6q1",
        prompt: "How many levels of recursion does merge sort have for n elements?",
        options: ["n", "√n", "log₂ n", "n / 2"],
        answer: 2,
        explanation: "Halving repeatedly reaches size 1 after about log₂ n levels.",
      },
      {
        id: "l6q2",
        prompt: "Why is merge sort's worst case no worse than its best case?",
        options: [
          "It shuffles the input first",
          "The split is always balanced and every merge is linear regardless of input",
          "It checks whether the array is sorted",
          "It uses a random pivot",
        ],
        answer: 1,
        explanation:
          "The division is positional, not value-based, so no input can unbalance it.",
      },
      {
        id: "l6q3",
        prompt: "What is the main drawback of classic merge sort?",
        options: [
          "It is unstable",
          "It requires O(n) extra memory",
          "It is O(n²) on reversed input",
          "It cannot sort numbers",
        ],
        answer: 1,
        explanation: "The merge step needs temporary arrays proportional to n.",
      },
      {
        id: "l6q4",
        prompt: "During a merge of [2, 5] and [3, 4], which value is written first?",
        options: ["2", "3", "4", "5"],
        answer: 0,
        explanation: "The merge compares the two front elements, 2 and 3, and takes 2.",
      },
    ],
  },
  {
    id: 7,
    title: "Quick Sort and partitioning",
    subtitle: "Fast in practice, fragile in the worst case",
    minutes: 10,
    xpReward: 140,
    algorithm: "quick",
    lesson: [
      "Quick sort chooses a pivot and partitions the array so that everything smaller sits to its left and everything larger to its right. The pivot is then in its final position forever, and the two sides are sorted recursively.",
      "The Lomuto partition used in the visualizer keeps an index i marking the end of the 'smaller' region. It scans with j, and whenever A[j] belongs left it grows the region and swaps. Finally the pivot is swapped into position i + 1.",
      "With balanced partitions the recursion depth is log n and the total work is O(n log n) — with very small constants, which is why quick sort is usually the fastest comparison sort in practice.",
      "If the pivot is consistently the smallest or largest element (for example, taking the last element of an already-sorted array), each partition removes only one element and the cost degrades to O(n²). Real implementations avoid this with median-of-three or randomised pivots, and switch to heap sort if the recursion gets too deep (introsort).",
    ],
    keyPoints: [
      "Partitioning puts the pivot in its final place permanently",
      "Average O(n log n), worst case O(n²) with bad pivots",
      "In-place, but O(log n) stack space for the recursion",
      "Unstable; mitigated in practice by randomised or median-of-three pivots",
    ],
    quiz: [
      {
        id: "l7q1",
        prompt: "After a partition step, what is true about the pivot?",
        options: [
          "It is at the centre of the array",
          "It is in its final sorted position",
          "It must be moved again later",
          "It is the smallest element",
        ],
        answer: 1,
        explanation:
          "Everything smaller is left of it and everything larger is right of it, so it never moves again.",
      },
      {
        id: "l7q2",
        prompt: "Which input triggers quick sort's O(n²) worst case with a last-element pivot?",
        options: [
          "A randomly shuffled array",
          "An already sorted array",
          "An array of all distinct primes",
          "An array of length 1",
        ],
        answer: 1,
        explanation:
          "Sorted input makes the pivot the maximum every time, so each partition peels off one element.",
      },
      {
        id: "l7q3",
        prompt: "How do real libraries reduce the risk of the worst case?",
        options: [
          "They sort twice",
          "They use randomised or median-of-three pivot selection",
          "They add extra memory",
          "They disable recursion",
        ],
        answer: 1,
        explanation:
          "Randomising the pivot makes adversarial inputs vanishingly unlikely.",
      },
      {
        id: "l7q4",
        prompt: "Quick sort's space complexity is O(log n) because…",
        options: [
          "It copies the array log n times",
          "Of the recursion call stack on balanced partitions",
          "It stores a hash table",
          "It allocates a temporary merge buffer",
        ],
        answer: 1,
        explanation:
          "It sorts in place; the only extra memory is the recursion stack, log n deep when balanced.",
      },
    ],
  },
  {
    id: 8,
    title: "Heap Sort and the binary heap",
    subtitle: "O(n log n) with O(1) extra space",
    minutes: 10,
    xpReward: 140,
    algorithm: "heap",
    lesson: [
      "A binary heap is a complete binary tree stored directly in the array: the children of index i live at 2i + 1 and 2i + 2. In a max-heap every parent is at least as large as its children, so the maximum sits at index 0.",
      "Heap sort first builds a max-heap by sifting down every internal node from the middle of the array backwards. Surprisingly this costs only O(n), not O(n log n), because most nodes are near the bottom and sift down very little.",
      "Then it repeatedly swaps the root with the last unsorted element — placing the maximum in its final slot — shrinks the heap by one and sifts the new root down. Each of the n − 1 extractions costs O(log n), giving O(n log n) overall.",
      "Heap sort guarantees O(n log n) in every case and needs no extra memory, but it is unstable and jumps around the array, so its cache behaviour makes it slower than quick sort in practice. It is often used as the safety net inside introsort.",
    ],
    keyPoints: [
      "Children of index i are at 2i + 1 and 2i + 2",
      "Building the heap is O(n); each extraction is O(log n)",
      "Guaranteed O(n log n), O(1) extra space",
      "Unstable, with weak cache locality",
    ],
    quiz: [
      {
        id: "l8q1",
        prompt: "In an array-based binary heap, where are the children of index 3?",
        options: ["4 and 5", "6 and 7", "7 and 8", "5 and 6"],
        answer: 2,
        explanation: "Children of index i are at 2i + 1 and 2i + 2, so 7 and 8.",
      },
      {
        id: "l8q2",
        prompt: "What is the cost of building a max-heap from an unordered array?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
        answer: 1,
        explanation:
          "The sum over all levels telescopes to O(n) because most nodes sift down very few levels.",
      },
      {
        id: "l8q3",
        prompt: "In the extraction phase, which element is swapped with the root?",
        options: [
          "The middle element",
          "The last element of the current heap",
          "A random element",
          "The second largest",
        ],
        answer: 1,
        explanation:
          "The root (maximum) is swapped into the last heap slot, which then leaves the heap as sorted.",
      },
      {
        id: "l8q4",
        prompt: "Why is heap sort often slower than quick sort despite the same Big-O?",
        options: [
          "It uses more memory",
          "Its scattered index jumps have poor cache locality",
          "It performs more comparisons than O(n log n)",
          "It is recursive",
        ],
        answer: 1,
        explanation:
          "Parent/child jumps stride across the array, causing frequent cache misses.",
      },
    ],
  },
  {
    id: 9,
    title: "Shell Sort and gap sequences",
    subtitle: "Bridging the quadratic and logarithmic worlds",
    minutes: 8,
    xpReward: 140,
    algorithm: "shell",
    lesson: [
      "Insertion sort is slow on reversed data because each element can only move one position per swap. Shell sort fixes exactly that: it runs insertion sort on elements a gap apart, so a value can leap many positions in one move.",
      "Starting with a large gap (commonly n/2) the array becomes 'h-sorted' — every h-th element is in order. The gap then shrinks, and each pass has less work to do because the array is progressively closer to sorted.",
      "When the gap finally reaches 1 the algorithm is a plain insertion sort, but now on almost-ordered data, which is its best case.",
      "The complexity depends entirely on the gap sequence. The naive halving sequence is O(n²) in the worst case, while Sedgewick's sequence achieves O(n^4/3). Shell sort is in-place, not stable, and remains popular in embedded code because it is short and needs no recursion.",
    ],
    keyPoints: [
      "Gapped insertion sort lets elements travel far in one move",
      "Complexity depends on the gap sequence, not just n",
      "In-place, O(1) memory, no recursion",
      "Not stable — gapped moves jump over equal values",
    ],
    quiz: [
      {
        id: "l9q1",
        prompt: "What does the final gap-1 pass of shell sort amount to?",
        options: [
          "A merge step",
          "A plain insertion sort on nearly sorted data",
          "A partition step",
          "A heap build",
        ],
        answer: 1,
        explanation:
          "Gap 1 is ordinary insertion sort, which is cheap because earlier passes removed most inversions.",
      },
      {
        id: "l9q2",
        prompt: "Shell sort's asymptotic complexity depends mainly on…",
        options: [
          "The programming language",
          "The chosen gap sequence",
          "The array values",
          "The recursion depth",
        ],
        answer: 1,
        explanation:
          "Different gap sequences give provably different bounds, from O(n²) to O(n^4/3).",
      },
      {
        id: "l9q3",
        prompt: "Why is shell sort not stable?",
        options: [
          "It uses extra memory",
          "Gapped moves can jump an element over an equal one",
          "It sorts descending",
          "It uses recursion",
        ],
        answer: 1,
        explanation:
          "Long gapped shifts can reorder equal elements relative to each other.",
      },
    ],
  },
  {
    id: 10,
    title: "Choosing the right algorithm",
    subtitle: "Stability, memory, lower bounds and real libraries",
    minutes: 9,
    xpReward: 180,
    lesson: [
      "No comparison sort can beat Ω(n log n) in the worst case. The proof is a decision tree: with n! possible orderings and each comparison giving one bit of information, any correct algorithm needs at least log₂(n!) ≈ n log n comparisons.",
      "So the choice between O(n log n) sorts is about constants, memory and guarantees. Quick sort is usually fastest but has an O(n²) worst case. Merge sort guarantees O(n log n) and stability but needs O(n) memory. Heap sort guarantees O(n log n) with O(1) memory but is cache-unfriendly.",
      "Real libraries hybridise. Java uses dual-pivot quick sort for primitives (stability is meaningless for ints) and TimSort — a merge/insertion hybrid — for objects. C++'s std::sort is introsort: quick sort that switches to heap sort when the recursion gets too deep and to insertion sort for tiny ranges.",
      "Practical checklist: do you need stability? Is memory constrained? Do you need a hard worst-case guarantee? Is the data nearly sorted or tiny? Answering those four questions picks the algorithm for you.",
    ],
    keyPoints: [
      "Ω(n log n) is a hard lower bound for comparison sorts",
      "Java: dual-pivot quick sort for primitives, TimSort for objects",
      "C++ std::sort is introsort (quick → heap → insertion)",
      "Pick using: stability, memory, worst-case guarantee, input shape",
    ],
    quiz: [
      {
        id: "l10q1",
        prompt: "What is the lower bound on comparisons for any comparison-based sort?",
        options: ["Ω(n)", "Ω(n log n)", "Ω(n²)", "There is none"],
        answer: 1,
        explanation:
          "The decision-tree argument gives log₂(n!) ≈ n log n comparisons in the worst case.",
      },
      {
        id: "l10q2",
        prompt: "You must sort employee records by department, preserving the existing name order within each department. You need…",
        options: [
          "Any O(n log n) sort",
          "A stable sort such as merge sort / TimSort",
          "Heap sort",
          "Selection sort",
        ],
        answer: 1,
        explanation:
          "Preserving the relative order of equal keys is exactly the definition of stability.",
      },
      {
        id: "l10q3",
        prompt: "Introsort switches from quick sort to heap sort when…",
        options: [
          "The array is stable",
          "The recursion depth grows too large, signalling bad pivots",
          "Memory runs out",
          "The array is sorted",
        ],
        answer: 1,
        explanation:
          "The depth limit caps the worst case at O(n log n) while keeping quick sort's speed.",
      },
      {
        id: "l10q4",
        prompt: "Memory is extremely tight and you need a hard O(n log n) guarantee. Choose:",
        options: ["Merge sort", "Heap sort", "Bubble sort", "Quick sort"],
        answer: 1,
        explanation:
          "Heap sort is the only one of these with both an O(n log n) guarantee and O(1) extra space.",
      },
    ],
  },
];

export const getLevel = (id: number): Level | undefined =>
  levels.find((l) => l.id === id);

export const getQuestion = (levelId: number, questionId: string): QuizQuestion | undefined =>
  getLevel(levelId)?.quiz.find((q) => q.id === questionId);

export const getAlgorithmSlug = (levelId: number): string | null =>
  getLevel(levelId)?.algorithm ?? null;

export const TOTAL_XP_AVAILABLE = levels.reduce((sum, l) => sum + l.xpReward, 0);
