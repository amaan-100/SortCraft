package com.sortcraft.backend.data;

import com.sortcraft.backend.model.Level;
import com.sortcraft.backend.model.QuizQuestion;

import java.util.List;

/**
 * Java port of {@code src/data/levels.ts}: all 10 learning levels, their lessons,
 * key points and quizzes. Question ids and answers match the answer key embedded
 * in the Supabase {@code record_quiz_attempt()} RPC.
 */
public final class LevelCatalog {

    private LevelCatalog() {
    }

    public static final double PASS_RATIO = 0.6;

    public static int totalXpAvailable() {
        int sum = 0;
        for (Level level : all()) {
            sum += level.getXpReward();
        }
        return sum;
    }

    public static List<Level> all() {
        return List.of(
                level1(), level2(), level3(), level4(), level5(),
                level6(), level7(), level8(), level9(), level10());
    }

    public static Level byId(int id) {
        for (Level level : all()) {
            if (level.getId() == id) {
                return level;
            }
        }
        return null;
    }

    private static QuizQuestion q(String id, String prompt, List<String> options,
                                  int answer, String explanation) {
        return new QuizQuestion(id, prompt, options, answer, explanation);
    }

    private static Level level1() {
        return new Level(1, "What sorting really is", "Order, keys, comparisons and why it matters",
                6, 80, null,
                List.of(
                        "Sorting means rearranging a collection so its elements follow a defined order — ascending or descending — according to a key. The key is whatever value you compare: a number, a surname, a timestamp.",
                        "Almost every comparison sort is built from two primitive operations: comparing two elements, and moving an element to a different position. Counting those two operations is how we measure cost, independently of how fast your laptop happens to be.",
                        "We describe that cost with Big-O notation, which keeps only the dominant term as the input grows. An algorithm that performs 3n² + 5n + 12 comparisons is simply O(n²): for large n the quadratic term drowns out everything else.",
                        "Sorted data unlocks faster algorithms elsewhere — binary search, duplicate detection, merging, grouping and median finding all assume order. That is why sorting is the first serious algorithm most courses teach."),
                List.of(
                        "A comparison sort only ever asks: 'does a come before b?'",
                        "Cost is measured in comparisons and moves, not seconds",
                        "Big-O keeps the dominant term as n grows",
                        "Sorting is a building block for search and grouping"),
                List.of(
                        q("l1q1", "Which two primitive operations do comparison sorts count?",
                                List.of("Additions and multiplications", "Comparisons and element moves",
                                        "Memory allocations and frees", "Reads and network calls"),
                                1, "Comparison sorts are analysed by how many comparisons they make and how many times they move data."),
                        q("l1q2", "An algorithm performs 4n² + 100n + 9 comparisons. Its complexity is:",
                                List.of("O(n)", "O(n log n)", "O(n²)", "O(4n²)"),
                                2, "Big-O drops constants and lower-order terms, leaving the dominant n² term."),
                        q("l1q3", "Why does sorting data first often speed up later work?",
                                List.of("Sorted arrays use less memory", "Sorted data enables binary search and easy grouping",
                                        "Sorting compresses the data", "CPUs skip sorted arrays"),
                                1, "Order is a precondition for binary search, merging and many grouping techniques.")));
    }

    private static Level level2() {
        return new Level(2, "Bubble Sort", "Adjacent swaps and the early-exit optimisation",
                8, 100, "bubble",
                List.of(
                        "Bubble sort repeatedly walks the array comparing each neighbouring pair and swapping them when they are out of order. After the first pass the largest value has 'bubbled' all the way to the end, so the next pass can stop one position earlier.",
                        "Every pass locks exactly one more element into place at the right-hand end, so at most n − 1 passes are required. That gives n(n−1)/2 comparisons in the worst case — O(n²).",
                        "The classic optimisation is a `swapped` flag. If a full pass completes without a single swap, the array must already be sorted and we can exit immediately. On already-sorted input this reduces the cost to a single pass: O(n).",
                        "Because bubble sort only swaps strictly out-of-order neighbours, equal elements never jump over each other — bubble sort is stable. It also sorts inside the original array, so it is in-place with O(1) extra space."),
                List.of(
                        "Each pass pushes the next largest value to the end",
                        "Worst and average case O(n²); best case O(n) with the swapped flag",
                        "Stable and in-place",
                        "Great for teaching, poor for production"),
                List.of(
                        q("l2q1", "After the first complete pass of bubble sort (ascending), what is guaranteed?",
                                List.of("The smallest element is at index 0", "The largest element is at the last index",
                                        "The array is half sorted", "Nothing is guaranteed"),
                                1, "The largest value is repeatedly swapped rightwards until it reaches the final position."),
                        q("l2q2", "What is bubble sort's best-case complexity with the early-exit flag?",
                                List.of("O(1)", "O(n)", "O(n log n)", "O(n²)"),
                                1, "On already-sorted input one pass makes no swaps, so the algorithm stops after n − 1 comparisons."),
                        q("l2q3", "Bubble sort is stable because…",
                                List.of("It uses extra memory to preserve order",
                                        "It only swaps strictly out-of-order neighbours, so equal items never cross",
                                        "It sorts from both ends at once", "It never swaps at all"),
                                1, "Using a strict > comparison means equal elements are left in their original relative order."),
                        q("l2q4", "How many comparisons does bubble sort make in the worst case for n = 5?",
                                List.of("5", "10", "20", "25"),
                                1, "n(n−1)/2 = 5 × 4 / 2 = 10 comparisons.")));
    }

    private static Level level3() {
        return new Level(3, "Selection Sort", "Minimise the number of writes",
                7, 100, "selection",
                List.of(
                        "Selection sort divides the array into a sorted prefix and an unsorted suffix. Each pass scans the entire unsorted region looking for the smallest value, then swaps it into the first unsorted slot.",
                        "The scan always examines every remaining element, so the comparison count is fixed at n(n−1)/2 regardless of the input. Selection sort has no best case — sorted input costs exactly the same as reversed input.",
                        "Its redeeming feature is write count: at most n − 1 swaps happen in total. When writing is expensive — flash memory, for instance — that matters more than comparisons.",
                        "The long-distance swap is also what makes selection sort unstable: moving a distant minimum into place can jump it over an equal value and reverse their original order."),
                List.of(
                        "Always Θ(n²) comparisons — best = average = worst",
                        "At most n − 1 swaps, the fewest of any simple sort",
                        "Unstable because of long-distance swaps",
                        "In-place, O(1) extra space"),
                List.of(
                        q("l3q1", "Why does selection sort have no better best case?",
                                List.of("It shuffles the array first",
                                        "It always scans the entire unsorted region to find the minimum",
                                        "It uses recursion",
                                        "It compares every pair twice"),
                                1, "The inner scan cannot stop early — the minimum could be the very last element."),
                        q("l3q2", "What is the maximum number of swaps selection sort performs on n elements?",
                                List.of("n − 1", "n log n", "n²/2", "n²"),
                                0, "One swap per pass, and there are n − 1 passes."),
                        q("l3q3", "When is selection sort a reasonable choice?",
                                List.of("When the data is already nearly sorted",
                                        "When writes are far more expensive than comparisons",
                                        "When stability is required", "When n is very large"),
                                1, "Its minimal write count suits memory where writing is costly or wears the device.")));
    }

    private static Level level4() {
        return new Level(4, "Insertion Sort", "The card-player's algorithm",
                8, 100, "insertion",
                List.of(
                        "Insertion sort grows a sorted prefix one element at a time. It lifts the next element out as the 'key', shifts every larger element of the prefix one slot right, and drops the key into the gap — exactly how most people sort a hand of cards.",
                        "On nearly sorted data the inner while-loop exits almost immediately, so the algorithm costs O(n). This makes insertion sort the fastest simple sort for small or almost-ordered inputs.",
                        "On reversed input every element must travel the whole way to the front, giving n(n−1)/2 shifts — O(n²).",
                        "It is stable, in-place, and adaptive. Real libraries use it as the base case of quick sort and merge sort: below roughly 16 elements it beats the fancier algorithms because it has almost no overhead."),
                List.of(
                        "Best case O(n) on nearly sorted data — it is adaptive",
                        "Worst case O(n²) on reversed data",
                        "Stable and in-place",
                        "Used as the base case inside real hybrid sorts"),
                List.of(
                        q("l4q1", "Insertion sort is called 'adaptive' because…",
                                List.of("It changes algorithm halfway",
                                        "Its running time improves when the input is already partly ordered",
                                        "It adapts the array size", "It picks a random pivot"),
                                1, "Fewer inversions means fewer shifts, so nearly sorted input approaches O(n)."),
                        q("l4q2", "In the shifting loop, what happens to elements larger than the key?",
                                List.of("They are deleted", "They are swapped with the key one at a time",
                                        "They are copied one position to the right", "They are moved to a temporary array"),
                                2, "Insertion sort shifts (copies) larger elements right, then writes the key once — cheaper than repeated swaps."),
                        q("l4q3", "Why do production sorts fall back to insertion sort on small sub-arrays?",
                                List.of("It is the only stable sort",
                                        "Its constant factors and overhead are tiny for small n",
                                        "It needs no comparisons", "It works without memory"),
                                1, "Asymptotics only dominate for large n; for small n the low overhead of insertion sort wins.")));
    }

    private static Level level5() {
        return new Level(5, "Comparing the quadratic sorts", "Stability, adaptivity and choosing between them",
                7, 120, null,
                List.of(
                        "Bubble, selection and insertion sort all run in O(n²) on average, yet they behave very differently. Use the comparison page to race them on the same array and watch the counters diverge.",
                        "Bubble sort makes the most swaps: every inversion costs a swap. Insertion sort makes the same number of moves but implements them as cheaper shifts. Selection sort makes the fewest writes but never fewer comparisons.",
                        "Stability decides whether equal elements keep their original relative order. Bubble and insertion sort are stable; selection sort is not, because it swaps across long distances.",
                        "Adaptivity decides whether existing order helps. Bubble (with the flag) and insertion sort are adaptive; selection sort is not. In practice, insertion sort is the best of the three for real data."),
                List.of(
                        "Same Big-O, very different constants and behaviour",
                        "Stable: bubble, insertion — Unstable: selection",
                        "Adaptive: bubble (flag), insertion — Not adaptive: selection",
                        "Selection sort minimises writes; insertion sort minimises real-world time"),
                List.of(
                        q("l5q1", "Which of the three simple sorts is NOT stable?",
                                List.of("Bubble sort", "Insertion sort", "Selection sort", "All are stable"),
                                2, "Selection sort's long-distance swap can move an element past an equal one."),
                        q("l5q2", "You must sort 40 records on a device where each write wears out the memory. Which do you choose?",
                                List.of("Bubble sort", "Selection sort", "Insertion sort", "Any of them"),
                                1, "Selection sort performs at most n − 1 writes of array elements."),
                        q("l5q3", "Your data arrives almost sorted apart from a few late entries. Best choice?",
                                List.of("Selection sort", "Insertion sort", "Bubble sort without the flag", "None"),
                                1, "Insertion sort is adaptive: few inversions means close to linear time.")));
    }

    private static Level level6() {
        return new Level(6, "Divide and conquer: Merge Sort", "Guaranteed O(n log n) at the cost of memory",
                10, 140, "merge",
                List.of(
                        "Merge sort splits the array in half, sorts each half recursively, and merges the two sorted halves back together. The recursion bottoms out at single elements, which are trivially sorted.",
                        "Merging two sorted lists of total length n takes exactly n writes and at most n − 1 comparisons: repeatedly take the smaller front element. Because the recursion has log₂ n levels and each level merges n elements, the total cost is Θ(n log n) — in the best, average and worst case alike.",
                        "The price is memory. The standard merge copies the halves into temporary arrays, so merge sort needs O(n) auxiliary space and is not in-place.",
                        "Merge sort is stable when the merge prefers the left half on ties, which is why Java's `Arrays.sort` for objects uses a merge-sort variant (TimSort) — stability matters when sorting records by multiple keys."),
                List.of(
                        "Θ(n log n) in every case — no bad inputs",
                        "Needs O(n) auxiliary memory",
                        "Stable when ties prefer the left half",
                        "Basis of TimSort, used for objects in Java and Python"),
                List.of(
                        q("l6q1", "How many levels of recursion does merge sort have for n elements?",
                                List.of("n", "√n", "log₂ n", "n / 2"),
                                2, "Halving repeatedly reaches size 1 after about log₂ n levels."),
                        q("l6q2", "Why is merge sort's worst case no worse than its best case?",
                                List.of("It shuffles the input first",
                                        "The split is always balanced and every merge is linear regardless of input",
                                        "It checks whether the array is sorted", "It uses a random pivot"),
                                1, "The division is positional, not value-based, so no input can unbalance it."),
                        q("l6q3", "What is the main drawback of classic merge sort?",
                                List.of("It is unstable", "It requires O(n) extra memory", "It is O(n²) on reversed input",
                                        "It cannot sort numbers"),
                                1, "The merge step needs temporary arrays proportional to n."),
                        q("l6q4", "During a merge of [2, 5] and [3, 4], which value is written first?",
                                List.of("2", "3", "4", "5"),
                                0, "The merge compares the two front elements, 2 and 3, and takes 2.")));
    }

    private static Level level7() {
        return new Level(7, "Quick Sort and partitioning", "Fast in practice, fragile in the worst case",
                10, 140, "quick",
                List.of(
                        "Quick sort chooses a pivot and partitions the array so that everything smaller sits to its left and everything larger to its right. The pivot is then in its final position forever, and the two sides are sorted recursively.",
                        "The Lomuto partition used in the visualizer keeps an index i marking the end of the 'smaller' region. It scans with j, and whenever A[j] belongs left it grows the region and swaps. Finally the pivot is swapped into position i + 1.",
                        "With balanced partitions the recursion depth is log n and the total work is O(n log n) — with very small constants, which is why quick sort is usually the fastest comparison sort in practice.",
                        "If the pivot is consistently the smallest or largest element (for example, taking the last element of an already-sorted array), each partition removes only one element and the cost degrades to O(n²). Real implementations avoid this with median-of-three or randomised pivots, and switch to heap sort if the recursion gets too deep (introsort)."),
                List.of(
                        "Partitioning puts the pivot in its final place permanently",
                        "Average O(n log n), worst case O(n²) with bad pivots",
                        "In-place, but O(log n) stack space for the recursion",
                        "Unstable; mitigated in practice by randomised or median-of-three pivots"),
                List.of(
                        q("l7q1", "After a partition step, what is true about the pivot?",
                                List.of("It is at the centre of the array", "It is in its final sorted position",
                                        "It must be moved again later", "It is the smallest element"),
                                1, "Everything smaller is left of it and everything larger is right of it, so it never moves again."),
                        q("l7q2", "Which input triggers quick sort's O(n²) worst case with a last-element pivot?",
                                List.of("A randomly shuffled array", "An already sorted array",
                                        "An array of all distinct primes", "An array of length 1"),
                                1, "Sorted input makes the pivot the maximum every time, so each partition peels off one element."),
                        q("l7q3", "How do real libraries reduce the risk of the worst case?",
                                List.of("They sort twice", "They use randomised or median-of-three pivot selection",
                                        "They add extra memory", "They disable recursion"),
                                1, "Randomising the pivot makes adversarial inputs vanishingly unlikely."),
                        q("l7q4", "Quick sort's space complexity is O(log n) because…",
                                List.of("It copies the array log n times",
                                        "Of the recursion call stack on balanced partitions",
                                        "It stores a hash table", "It allocates a temporary merge buffer"),
                                1, "It sorts in place; the only extra memory is the recursion stack, log n deep when balanced.")));
    }

    private static Level level8() {
        return new Level(8, "Heap Sort and the binary heap", "O(n log n) with O(1) extra space",
                10, 140, "heap",
                List.of(
                        "A binary heap is a complete binary tree stored directly in the array: the children of index i live at 2i + 1 and 2i + 2. In a max-heap every parent is at least as large as its children, so the maximum sits at index 0.",
                        "Heap sort first builds a max-heap by sifting down every internal node from the middle of the array backwards. Surprisingly this costs only O(n), not O(n log n), because most nodes are near the bottom and sift down very little.",
                        "Then it repeatedly swaps the root with the last unsorted element — placing the maximum in its final slot — shrinks the heap by one and sifts the new root down. Each of the n − 1 extractions costs O(log n), giving O(n log n) overall.",
                        "Heap sort guarantees O(n log n) in every case and needs no extra memory, but it is unstable and jumps around the array, so its cache behaviour makes it slower than quick sort in practice. It is often used as the safety net inside introsort."),
                List.of(
                        "Children of index i are at 2i + 1 and 2i + 2",
                        "Building the heap is O(n); each extraction is O(log n)",
                        "Guaranteed O(n log n), O(1) extra space",
                        "Unstable, with weak cache locality"),
                List.of(
                        q("l8q1", "In an array-based binary heap, where are the children of index 3?",
                                List.of("4 and 5", "6 and 7", "7 and 8", "5 and 6"),
                                2, "Children of index i are at 2i + 1 and 2i + 2, so 7 and 8."),
                        q("l8q2", "What is the cost of building a max-heap from an unordered array?",
                                List.of("O(log n)", "O(n)", "O(n log n)", "O(n²)"),
                                1, "The sum over all levels telescopes to O(n) because most nodes sift down very few levels."),
                        q("l8q3", "In the extraction phase, which element is swapped with the root?",
                                List.of("The middle element", "The last element of the current heap",
                                        "A random element", "The second largest"),
                                1, "The root (maximum) is swapped into the last heap slot, which then leaves the heap as sorted."),
                        q("l8q4", "Why is heap sort often slower than quick sort despite the same Big-O?",
                                List.of("It uses more memory", "Its scattered index jumps have poor cache locality",
                                        "It performs more comparisons than O(n log n)", "It is recursive"),
                                1, "Parent/child jumps stride across the array, causing frequent cache misses.")));
    }

    private static Level level9() {
        return new Level(9, "Shell Sort and gap sequences", "Bridging the quadratic and logarithmic worlds",
                8, 140, "shell",
                List.of(
                        "Insertion sort is slow on reversed data because each element can only move one position per swap. Shell sort fixes exactly that: it runs insertion sort on elements a gap apart, so a value can leap many positions in one move.",
                        "Starting with a large gap (commonly n/2) the array becomes 'h-sorted' — every h-th element is in order. The gap then shrinks, and each pass has less work to do because the array is progressively closer to sorted.",
                        "When the gap finally reaches 1 the algorithm is a plain insertion sort, but now on almost-ordered data, which is its best case.",
                        "The complexity depends entirely on the gap sequence. The naive halving sequence is O(n²) in the worst case, while Sedgewick's sequence achieves O(n^4/3). Shell sort is in-place, not stable, and remains popular in embedded code because it is short and needs no recursion."),
                List.of(
                        "Gapped insertion sort lets elements travel far in one move",
                        "Complexity depends on the gap sequence, not just n",
                        "In-place, O(1) memory, no recursion",
                        "Not stable — gapped moves jump over equal values"),
                List.of(
                        q("l9q1", "What does the final gap-1 pass of shell sort amount to?",
                                List.of("A merge step", "A plain insertion sort on nearly sorted data",
                                        "A partition step", "A heap build"),
                                1, "Gap 1 is ordinary insertion sort, which is cheap because earlier passes removed most inversions."),
                        q("l9q2", "Shell sort's asymptotic complexity depends mainly on…",
                                List.of("The programming language", "The chosen gap sequence",
                                        "The array values", "The recursion depth"),
                                1, "Different gap sequences give provably different bounds, from O(n²) to O(n^4/3)."),
                        q("l9q3", "Why is shell sort not stable?",
                                List.of("It uses extra memory", "Gapped moves can jump an element over an equal one",
                                        "It sorts descending", "It uses recursion"),
                                1, "Long gapped shifts can reorder equal elements relative to each other.")));
    }

    private static Level level10() {
        return new Level(10, "Choosing the right algorithm", "Stability, memory, lower bounds and real libraries",
                9, 180, null,
                List.of(
                        "No comparison sort can beat Ω(n log n) in the worst case. The proof is a decision tree: with n! possible orderings and each comparison giving one bit of information, any correct algorithm needs at least log₂(n!) ≈ n log n comparisons.",
                        "So the choice between O(n log n) sorts is about constants, memory and guarantees. Quick sort is usually fastest but has an O(n²) worst case. Merge sort guarantees O(n log n) and stability but needs O(n) memory. Heap sort guarantees O(n log n) with O(1) memory but is cache-unfriendly.",
                        "Real libraries hybridise. Java uses dual-pivot quick sort for primitives (stability is meaningless for ints) and TimSort — a merge/insertion hybrid — for objects. C++'s std::sort is introsort: quick sort that switches to heap sort when the recursion gets too deep and to insertion sort for tiny ranges.",
                        "Practical checklist: do you need stability? Is memory constrained? Do you need a hard worst-case guarantee? Is the data nearly sorted or tiny? Answering those four questions picks the algorithm for you."),
                List.of(
                        "Ω(n log n) is a hard lower bound for comparison sorts",
                        "Java: dual-pivot quick sort for primitives, TimSort for objects",
                        "C++ std::sort is introsort (quick → heap → insertion)",
                        "Pick using: stability, memory, worst-case guarantee, input shape"),
                List.of(
                        q("l10q1", "What is the lower bound on comparisons for any comparison-based sort?",
                                List.of("Ω(n)", "Ω(n log n)", "Ω(n²)", "There is none"),
                                1, "The decision-tree argument gives log₂(n!) ≈ n log n comparisons in the worst case."),
                        q("l10q2", "You must sort employee records by department, preserving the existing name order within each department. You need…",
                                List.of("Any O(n log n) sort", "A stable sort such as merge sort / TimSort",
                                        "Heap sort", "Selection sort"),
                                1, "Preserving the relative order of equal keys is exactly the definition of stability."),
                        q("l10q3", "Introsort switches from quick sort to heap sort when…",
                                List.of("The array is stable", "The recursion depth grows too large, signalling bad pivots",
                                        "Memory runs out", "The array is sorted"),
                                1, "The depth limit caps the worst case at O(n log n) while keeping quick sort's speed."),
                        q("l10q4", "Memory is extremely tight and you need a hard O(n log n) guarantee. Choose:",
                                List.of("Merge sort", "Heap sort", "Bubble sort", "Quick sort"),
                                1, "Heap sort is the only one of these with both an O(n log n) guarantee and O(1) extra space.")));
    }
}