import { Subject, Exam, Task, RevisionItem, PlannedSession, UserProfile } from './index';

export type AIExplanationLevel = 'simple' | 'exam-ready' | 'detailed';

export interface AISolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathExpression?: string;
}

export interface StructuredSolution {
  detectedQuestion: string;
  subject?: string;
  topic?: string;
  understanding: string;
  given?: string[];
  formulas?: string[];
  steps: AISolutionStep[];
  finalAnswer: string;
  commonPitfalls?: string[];
  alternativeMethod?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  conceptTag?: string; // e.g. "Gauss's Law", "Electric Potential", "Lens Combinations"
  options?: string[];
  correctAnswer: string;
  explanation: string;
  why?: string; // Conceptual rationale (Learning-first)
  remember?: string; // Short memory cue
  commonMistake?: string; // Likely misconception to avoid
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface PracticeConceptAnalysis {
  concept: string;
  isStrong: boolean;
  correctCount: number;
  totalCount: number;
}

export interface PracticeSet {
  id?: string;
  topic: string;
  subject: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  questions: PracticeQuestion[];
  completed: boolean;
  score?: number;
  total?: number;
  accuracyPercentage?: number;
  conceptBreakdown?: PracticeConceptAnalysis[];
}

export interface PracticeResultRecord {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  total: number;
  percentage: number;
  weakConcepts: string[];
  strongConcepts: string[];
  timestamp: string;
}

export interface TestSession {
  topic: string;
  subject: string;
  currentQuestionIndex: number;
  questions: {
    question: string;
    expectedConcepts: string[];
    userAnswer?: string;
    feedback?: string;
    score?: number; // 0-100
  }[];
  isFinished: boolean;
  finalScore?: number;
  conceptsToRevise?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredSolution?: StructuredSolution;
  practiceSet?: PracticeSet;
  testSession?: TestSession;
  isDemo?: boolean;
  suggestedActions?: {
    type:
      | 'explain-simpler'
      | 'give-example'
      | 'test-me'
      | 'add-revision'
      | 'add-notes'
      | 'quick-focus'
      | 'practice-set'
      | 'launch-practice'
      | 'show-alternative';
    label: string;
    payload?: any;
  }[];
}

export interface AIConversation {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  practiceSessionId?: string;
}

export interface AIContextFilter {
  includeSyllabus?: boolean;
  includeTasks?: boolean;
  includeExams?: boolean;
  includeRevision?: boolean;
  includeRecentSessions?: boolean;
  currentSubject?: string;
  currentTopic?: string;
}

export interface AIContextPayload {
  student: {
    name: string;
    grade: string;
    dailyGoalHours: number;
    priorities: string;
  };
  subjects: {
    name: string;
    chaptersCount: number;
    completionPercent: number;
    weakChapters: string[];
  }[];
  upcomingExams: {
    subject: string;
    name: string;
    daysRemaining: number;
    targetScore?: string | number;
  }[];
  pendingTasks: {
    title: string;
    subject: string;
    deadline: string;
    priority: string;
    durationMinutes: number;
  }[];
  dueRevisions: {
    topic: string;
    subject: string;
    intervalStage: number;
    daysSince: number;
  }[];
  activeStudyContext?: {
    currentSubject?: string;
    currentTopic?: string;
  };
}

export interface SnapSolveAnalysisResult {
  detectedQuestion: string;
  subject: string;
  topic: string;
  solution: StructuredSolution;
  confidence: number;
  isDemo?: boolean;
}
