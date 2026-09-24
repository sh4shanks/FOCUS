export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export type ChapterStatus = 'not-started' | 'in-progress' | 'completed' | 'revision-due';

export type RevisionUrgency = 'due-today' | 'upcoming' | 'mastered' | 'completed';

export interface UserProfile {
  name: string;
  grade: string;
  targetExam: string;
  dailyGoalHours: number;
  preferredStudyTimes: string[]; // e.g. ['Evening (6 PM - 9 PM)', 'Early Morning']
  academicPriorities: string;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  onboarded: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  chapterId?: string;
  deadline: string; // ISO or YYYY-MM-DD
  dueDate?: string;
  durationMinutes: number;
  priority: Priority;
  status: TaskStatus;
  tags: string[];
  notes?: string;
  parentAssignment?: string;
  completedAt?: string;
}

export interface Chapter {
  id: string;
  title: string;
  status: ChapterStatus;
  completionPercentage: number;
  topics: string[];
  estimatedHours: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examWeightage: 'Low' | 'Medium' | 'High';
  lastStudiedDate?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  iconName: string;
  chapters: Chapter[];
  targetExamDate?: string;
}

export interface Exam {
  id: string;
  subject: string;
  examName: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "09:00 AM"
  totalChapters: number;
  completedChapters: number;
  targetScore?: string | number;
  notes?: string;
  readinessScore?: number;
  recommendedDailyHours?: number;
  highYieldChapters?: string[];
  daysRemaining?: number;
  estimatedHoursNeeded?: number;
}

export interface RevisionItem {
  id: string;
  subject: string;
  topic: string;
  chapterId?: string;
  lastStudied: string; // YYYY-MM-DD
  daysSinceLastStudy: number;
  estimatedMinutes: number;
  urgency: RevisionUrgency;
  intervalStage: number; // Spaced repetition stage 1, 2, 3, 4
  intervalDays?: number;
  retentionScore?: number;
  nextRevisionDate?: string;
}

export interface PlannedSession {
  id: string;
  subject: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "18:00"
  durationMinutes: number;
  priority: Priority;
  completed: boolean;
  missed?: boolean;
}

export interface CompletedSessionRecord {
  id: string;
  title: string;
  subject: string;
  timestamp: string; // ISO
  durationMinutes: number;
  tasksCompleted: string[];
  productivityScore?: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  category: 'Subject' | 'Chapter' | 'Quick Note' | 'Revision Note' | 'Formula';
  content: string;
  formulaSnippets?: string[];
  tags: string[];
  isFavorite: boolean;
  isPinned?: boolean;
  notebookId?: string;
  updatedAt: string;
}

export interface FocusSessionStep {
  id: string;
  title: string;
  subject: string;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  type: 'revision' | 'practice' | 'deep-work' | 'review';
  completed: boolean;
}

export interface GeneratedFocusSession {
  totalMinutes: number;
  title: string;
  reasoning: string;
  steps: FocusSessionStep[];
}
