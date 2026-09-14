export interface BadgeSnapshot {
  completedLevelIds: number[];
  totalXp: number;
  perfectQuizzes: number;
  usedComparison: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  /** lucide icon name rendered by the BadgeGrid switch */
  icon: "footprints" | "layers" | "target" | "split" | "binary" | "flame" | "crown" | "sparkles";
  tone: "sky" | "violet" | "amber" | "emerald" | "rose";
  isEarned: (snapshot: BadgeSnapshot) => boolean;
  hint: string;
}

const has = (ids: number[], ...required: number[]) =>
  required.every((r) => ids.includes(r));

export const badges: Badge[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Completed your very first level.",
    icon: "footprints",
    tone: "sky",
    hint: "Finish Level 1.",
    isEarned: (s) => s.completedLevelIds.length >= 1,
  },
  {
    id: "quadratic-master",
    name: "Quadratic Master",
    description: "Finished bubble, selection and insertion sort.",
    icon: "layers",
    tone: "violet",
    hint: "Complete levels 2, 3 and 4.",
    isEarned: (s) => has(s.completedLevelIds, 2, 3, 4),
  },
  {
    id: "sharp-shooter",
    name: "Sharp Shooter",
    description: "Scored 100% on a quiz.",
    icon: "target",
    tone: "amber",
    hint: "Answer every question in a level correctly.",
    isEarned: (s) => s.perfectQuizzes >= 1,
  },
  {
    id: "flawless-three",
    name: "Flawless Three",
    description: "Scored 100% on three different quizzes.",
    icon: "flame",
    tone: "rose",
    hint: "Get three perfect quiz scores.",
    isEarned: (s) => s.perfectQuizzes >= 3,
  },
  {
    id: "divide-conquer",
    name: "Divide & Conquer",
    description: "Mastered merge sort and quick sort.",
    icon: "split",
    tone: "emerald",
    hint: "Complete levels 6 and 7.",
    isEarned: (s) => has(s.completedLevelIds, 6, 7),
  },
  {
    id: "heap-hero",
    name: "Heap Hero",
    description: "Conquered the binary heap.",
    icon: "binary",
    tone: "violet",
    hint: "Complete level 8.",
    isEarned: (s) => has(s.completedLevelIds, 8),
  },
  {
    id: "analyst",
    name: "The Analyst",
    description: "Raced algorithms side by side in the comparison lab.",
    icon: "sparkles",
    tone: "sky",
    hint: "Open the comparison page.",
    isEarned: (s) => s.usedComparison,
  },
  {
    id: "sortcraft-graduate",
    name: "SortCraft Graduate",
    description: "Completed all ten learning levels.",
    icon: "crown",
    tone: "amber",
    hint: "Complete every level.",
    isEarned: (s) => s.completedLevelIds.length >= 10,
  },
];

export const evaluateBadges = (snapshot: BadgeSnapshot): string[] =>
  badges.filter((b) => b.isEarned(snapshot)).map((b) => b.id);
