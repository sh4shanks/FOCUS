import { create } from 'zustand';
import {
  UserProfile,
  Subject,
  Exam,
  Task,
  RevisionItem,
  PlannedSession,
  CompletedSessionRecord,
  Note,
  GeneratedFocusSession,
  TaskStatus,
  ChapterStatus,
} from '../types';
import { AIConversation, ChatMessage, PracticeResultRecord, PracticeSet } from '../types/ai';
import { INITIAL_DEMO_CONVERSATIONS } from '../features/ai/services/demoAIService';
import {
  initialUserProfile,
  initialSubjects,
  initialExams,
  initialTasks,
  initialRevisionItems,
  initialPlannedSessions,
  initialCompletedRecords,
  initialNotes,
} from '../data/demoData';
import { redistributeMissedWorkload, generateAutoSchedule, AutoPlanRequest } from '../services/plannerAlgorithm';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'quick-focus'
  | 'focus-ai'
  | 'snap-solve'
  | 'practice'
  | 'syllabus'
  | 'planner'
  | 'tasks'
  | 'revision'
  | 'exams'
  | 'analytics'
  | 'notes'
  | 'settings';

interface FocusState {
  // State
  userProfile: UserProfile;
  subjects: Subject[];
  exams: Exam[];
  tasks: Task[];
  revisionItems: RevisionItem[];
  plannedSessions: PlannedSession[];
  completedRecords: CompletedSessionRecord[];
  notes: Note[];
  conversations: AIConversation[];
  activeConversationId: string | null;
  isAILoading: boolean;

  // Navigation & Modals
  currentView: AppView;
  activeFocusSession: GeneratedFocusSession | null;
  isFocusSessionActive: boolean;
  quickFocusModalOpen: boolean;
  onboardingOpen: boolean;
  preselectedQuickFocusDuration: number | null;
  preselectedTopic: string | null;
  preselectedSubject: string | null;

  // Practice Mode State
  practiceModalOpen: boolean;
  practiceInitialSubject: string | null;
  practiceInitialTopic: string | null;
  practiceInitialDifficulty: 'Easy' | 'Medium' | 'Hard' | null;
  practiceInitialCount: number | null;
  practiceInitialSet: PracticeSet | null;
  practiceAutoStart: boolean;
  recentPracticeResults: PracticeResultRecord[];

  // Actions
  setCurrentView: (view: AppView) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: (data: Partial<UserProfile>) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  breakDownAssignment: (title: string, subject: string, days: number) => void;

  // Syllabus & Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateChapterProgress: (subjectId: string, chapterId: string, progress: number, status?: ChapterStatus) => void;

  // Exams
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;

  // Revision
  completeRevisionItem: (id: string) => void;
  addRevisionItem: (item: Omit<RevisionItem, 'id'>) => void;

  // Planner
  addPlannedSession: (session: Omit<PlannedSession, 'id'>) => void;
  toggleSessionCompleted: (id: string) => void;
  deleteSession: (id: string) => void;
  runAutoSchedule: (req: AutoPlanRequest) => void;
  triggerAdaptiveRedistribution: () => { count: number; message: string };

  // Notes
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Quick Focus Modal & Active Session
  openQuickFocus: (duration?: number, topic?: string, subject?: string) => void;
  closeQuickFocus: () => void;
  startFocusSession: (session: GeneratedFocusSession) => void;
  finishFocusSession: (completedMinutes: number, tasksDone: string[]) => void;
  cancelFocusSession: () => void;

  // AI Copilot & Snap Solve Actions
  createConversation: (title?: string, initialMessage?: ChatMessage) => string;
  addMessageToConversation: (conversationId: string, message: ChatMessage) => void;
  updateMessageInConversation: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  setActiveConversationId: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addAIRevisionItem: (topic: string, subject: string) => void;
  addAINote: (title: string, subject: string, content: string, formulas?: string[]) => void;
  setIsAILoading: (loading: boolean) => void;

  // Practice Mode Actions
  openPracticeMode: (options?: {
    subject?: string;
    topic?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    count?: number;
    practiceSet?: PracticeSet;
    autoStart?: boolean;
  }) => void;
  closePracticeMode: () => void;
  recordPracticeResult: (result: PracticeResultRecord) => void;
  scheduleRevisionFromPractice: (params: {
    topic: string;
    subject: string;
    score: number;
    total: number;
    percentage: number;
    weakConcepts?: string[];
    strongConcepts?: string[];
    includeWeakConcepts?: boolean;
  }) => {
    mainItem: RevisionItem;
    weakItems: RevisionItem[];
    intervalDays: number;
    nextRevisionDate: string;
    stage: number;
  };

  // Data persistence & reset
  resetToDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'focus_os_app_state_v1';

// Safe load from localStorage
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored state', e);
  }
  return null;
}

const saved = loadSavedState();

function cleanTitleFromPrompt(text: string): string {
  let cleaned = text.trim();
  const prefixes = [
    /^explain\s+(to\s+me\s+)?(what\s+is\s+|how\s+to\s+|how\s+)?/i,
    /^can\s+you\s+(please\s+)?(explain|solve|help\s+with|test\s+me\s+on)\s+/i,
    /^please\s+(explain|solve|help\s+with)\s+/i,
    /^what\s+is\s+/i,
    /^how\s+does\s+/i,
    /^how\s+to\s+solve\s+/i,
    /^give\s+me\s+(\d+\s+)?questions\s+on\s+/i,
    /^practice\s+(me\s+on\s+|on\s+)?/i,
    /^help\s+with\s+/i,
  ];
  for (const rx of prefixes) {
    if (rx.test(cleaned)) {
      cleaned = cleaned.replace(rx, '');
      break;
    }
  }
  cleaned = cleaned.replace(/[?.!]+$/, '').trim();
  if (!cleaned) cleaned = text.slice(0, 32);
  if (cleaned.length > 38) cleaned = cleaned.slice(0, 36) + '...';
  return cleaned
    .split(' ')
    .map((w, idx) => (idx === 0 || w.length > 3 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export const useFocusStore = create<FocusState>((set, get) => ({
  userProfile: saved?.userProfile || initialUserProfile,
  subjects: saved?.subjects || initialSubjects,
  exams: saved?.exams || initialExams,
  tasks: saved?.tasks || initialTasks,
  revisionItems: saved?.revisionItems || initialRevisionItems,
  plannedSessions: saved?.plannedSessions || initialPlannedSessions,
  completedRecords: saved?.completedRecords || initialCompletedRecords,
  notes: saved?.notes || initialNotes,
  conversations: saved?.conversations || INITIAL_DEMO_CONVERSATIONS,
  activeConversationId: saved?.activeConversationId || saved?.conversations?.[0]?.id || INITIAL_DEMO_CONVERSATIONS[0].id,
  isAILoading: false,

  // Initial view: if not onboarded, landing page; otherwise dashboard
  currentView: saved?.userProfile?.onboarded ? 'dashboard' : 'landing',
  activeFocusSession: null,
  isFocusSessionActive: false,
  quickFocusModalOpen: false,
  onboardingOpen: false,
  preselectedQuickFocusDuration: null,
  preselectedTopic: null,
  preselectedSubject: null,

  // Practice Mode
  practiceModalOpen: false,
  practiceInitialSubject: null,
  practiceInitialTopic: null,
  practiceInitialDifficulty: null,
  practiceInitialCount: null,
  practiceInitialSet: null,
  practiceAutoStart: false,
  recentPracticeResults: saved?.recentPracticeResults || [],

  setCurrentView: (view) => set({ currentView: view }),

  updateUserProfile: (profile) => {
    set((state) => {
      const updated = { ...state.userProfile, ...profile };
      saveState({ ...state, userProfile: updated });
      return { userProfile: updated };
    });
  },

  updateProfile: (profile) => {
    set((state) => {
      const updated = { ...state.userProfile, ...profile };
      saveState({ ...state, userProfile: updated });
      return { userProfile: updated };
    });
  },

  completeOnboarding: (data) => {
    set((state) => {
      const updated = {
        ...state.userProfile,
        ...data,
        onboarded: true,
      };
      saveState({ ...state, userProfile: updated });
      return {
        userProfile: updated,
        onboardingOpen: false,
        currentView: 'dashboard',
      };
    });
  },

  // Task actions
  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    set((state) => {
      const tasks = [newTask, ...state.tasks];
      saveState({ ...state, tasks });
      return { tasks };
    });
  },

  updateTask: (task) => {
    set((state) => {
      const tasks = state.tasks.map((t) => (t.id === task.id ? task : t));
      saveState({ ...state, tasks });
      return { tasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      saveState({ ...state, tasks });
      return { tasks };
    });
  },

  toggleTaskStatus: (id) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
      saveState({ ...state, tasks });
      return { tasks };
    });
  },

  breakDownAssignment: (title, subject, days) => {
    const now = new Date();
    const dayInterval = Math.max(1, Math.floor(days / 5));

    const subtasksData = [
      { step: 1, title: `Phase 1: Thesis, scope & collect primary sources for ${title}`, duration: 45, dayOffset: 1 },
      { step: 2, title: `Phase 2: Outline 4 core arguments & structure for ${title}`, duration: 30, dayOffset: Math.min(days, 1 + dayInterval) },
      { step: 3, title: `Phase 3: Draft introduction and primary sections for ${title}`, duration: 60, dayOffset: Math.min(days, 1 + dayInterval * 2) },
      { step: 4, title: `Phase 4: Draft body arguments and conclusion for ${title}`, duration: 60, dayOffset: Math.min(days, 1 + dayInterval * 3) },
      { step: 5, title: `Phase 5: Citations, bibliography & final proofread for ${title}`, duration: 30, dayOffset: days },
    ];

    const newTasks: Task[] = subtasksData.map((st) => {
      const d = new Date(now.getTime() + st.dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      return {
        id: `task-sub-${Date.now()}-${st.step}`,
        title: st.title,
        subject,
        deadline: dateStr,
        dueDate: dateStr,
        durationMinutes: st.duration,
        priority: st.step >= 4 ? 'high' : 'medium',
        status: 'todo',
        tags: ['assignment', 'breakdown'],
        parentAssignment: title,
      };
    });

    set((state) => {
      const tasks = [...newTasks, ...state.tasks];
      saveState({ ...state, tasks });
      return { tasks };
    });
  },

  // Syllabus & Subjects
  addSubject: (subjData) => {
    const newSubject: Subject = {
      ...subjData,
      id: `subj-${Date.now()}`,
    };
    set((state) => {
      const subjects = [...state.subjects, newSubject];
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  updateChapterProgress: (subjectId, chapterId, progress, status) => {
    set((state) => {
      const subjects = state.subjects.map((subj) => {
        if (subj.id !== subjectId) return subj;
        const chapters = subj.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          let computedStatus: ChapterStatus = status || ch.status;
          if (!status) {
            if (progress >= 100) computedStatus = 'completed';
            else if (progress > 0) computedStatus = 'in-progress';
            else computedStatus = 'not-started';
          }
          return {
            ...ch,
            completionPercentage: Math.min(100, Math.max(0, progress)),
            status: computedStatus,
            lastStudiedDate: new Date().toISOString().split('T')[0],
          };
        });
        return { ...subj, chapters };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  // Exams
  addExam: (examData) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    set((state) => {
      const exams = [...state.exams, newExam];
      saveState({ ...state, exams });
      return { exams };
    });
  },

  updateExam: (exam) => {
    set((state) => {
      const exams = state.exams.map((e) => (e.id === exam.id ? exam : e));
      saveState({ ...state, exams });
      return { exams };
    });
  },

  deleteExam: (id) => {
    set((state) => {
      const exams = state.exams.filter((e) => e.id !== id);
      saveState({ ...state, exams });
      return { exams };
    });
  },

  // Revision
  completeRevisionItem: (id) => {
    set((state) => {
      const revisionItems = state.revisionItems.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            urgency: 'completed' as const,
            lastStudied: new Date().toISOString().split('T')[0],
            daysSinceLastStudy: 0,
            intervalStage: r.intervalStage + 1,
          };
        }
        return r;
      });
      saveState({ ...state, revisionItems });
      return { revisionItems };
    });
  },

  addRevisionItem: (itemData) => {
    const newItem: RevisionItem = {
      ...itemData,
      id: `rev-${Date.now()}`,
    };
    set((state) => {
      const revisionItems = [newItem, ...state.revisionItems];
      saveState({ ...state, revisionItems });
      return { revisionItems };
    });
  },

  // Planner
  addPlannedSession: (sessionData) => {
    const newSession: PlannedSession = {
      ...sessionData,
      id: `plan-${Date.now()}`,
    };
    set((state) => {
      const plannedSessions = [...state.plannedSessions, newSession].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
      saveState({ ...state, plannedSessions });
      return { plannedSessions };
    });
  },

  toggleSessionCompleted: (id) => {
    set((state) => {
      const plannedSessions = state.plannedSessions.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
      saveState({ ...state, plannedSessions });
      return { plannedSessions };
    });
  },

  deleteSession: (id) => {
    set((state) => {
      const plannedSessions = state.plannedSessions.filter((s) => s.id !== id);
      saveState({ ...state, plannedSessions });
      return { plannedSessions };
    });
  },

  runAutoSchedule: (req) => {
    const { subjects, plannedSessions } = get();
    const generated = generateAutoSchedule(req, subjects);
    set((state) => {
      const combined = [...state.plannedSessions, ...generated];
      saveState({ ...state, plannedSessions: combined });
      return { plannedSessions: combined };
    });
  },

  triggerAdaptiveRedistribution: () => {
    const { plannedSessions, userProfile } = get();
    const result = redistributeMissedWorkload(plannedSessions, userProfile.dailyGoalHours);
    set((state) => {
      saveState({ ...state, plannedSessions: result.updatedSessions });
      return { plannedSessions: result.updatedSessions };
    });
    return { count: result.redistributedCount, message: result.message };
  },

  // Notes
  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    set((state) => {
      const notes = [newNote, ...state.notes];
      saveState({ ...state, notes });
      return { notes };
    });
  },

  updateNote: (note) => {
    const updated = { ...note, updatedAt: new Date().toISOString().split('T')[0] };
    set((state) => {
      const notes = state.notes.map((n) => (n.id === note.id ? updated : n));
      saveState({ ...state, notes });
      return { notes };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const notes = state.notes.filter((n) => n.id !== id);
      saveState({ ...state, notes });
      return { notes };
    });
  },

  toggleFavoriteNote: (id) => {
    set((state) => {
      const notes = state.notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
      saveState({ ...state, notes });
      return { notes };
    });
  },

  togglePinNote: (id) => {
    set((state) => {
      const notes = state.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
      saveState({ ...state, notes });
      return { notes };
    });
  },

  // Quick Focus Modal
  openQuickFocus: (duration, topic, subject) => {
    set({
      quickFocusModalOpen: true,
      preselectedQuickFocusDuration: duration || 30,
      preselectedTopic: topic || null,
      preselectedSubject: subject || null,
    });
  },

  closeQuickFocus: () => {
    set({
      quickFocusModalOpen: false,
      preselectedQuickFocusDuration: null,
      preselectedTopic: null,
      preselectedSubject: null,
    });
  },

  startFocusSession: (session) => {
    set({
      activeFocusSession: session,
      isFocusSessionActive: true,
      quickFocusModalOpen: false,
    });
  },

  finishFocusSession: (completedMinutes, tasksDone) => {
    const { activeFocusSession, userProfile, completedRecords } = get();
    const todayStr = new Date().toISOString().split('T')[0];

    const newRecord: CompletedSessionRecord = {
      id: `rec-${Date.now()}`,
      title: activeFocusSession?.title || `${completedMinutes}-Minute Focus Session`,
      subject: activeFocusSession?.steps[0]?.subject || 'Study',
      timestamp: new Date().toISOString(),
      durationMinutes: completedMinutes,
      tasksCompleted: tasksDone,
      productivityScore: 94,
    };

    // Update streak if today was not already recorded
    const isNewDayStreak = userProfile.lastActiveDate !== todayStr;
    const nextStreak = isNewDayStreak ? userProfile.streak + 1 : userProfile.streak;
    const bestStreak = Math.max(nextStreak, userProfile.bestStreak);

    set((state) => {
      const updatedRecords = [newRecord, ...state.completedRecords];
      const updatedProfile = {
        ...state.userProfile,
        streak: nextStreak,
        bestStreak,
        lastActiveDate: todayStr,
      };

      // Also mark corresponding revision or task completed if matched
      let updatedTasks = [...state.tasks];
      let updatedRevisions = [...state.revisionItems];

      tasksDone.forEach((taskTitle) => {
        updatedTasks = updatedTasks.map((t) =>
          taskTitle.toLowerCase().includes(t.title.toLowerCase()) || t.title.toLowerCase().includes(taskTitle.toLowerCase())
            ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
            : t
        );
        updatedRevisions = updatedRevisions.map((r) =>
          taskTitle.toLowerCase().includes(r.topic.toLowerCase()) || r.topic.toLowerCase().includes(taskTitle.toLowerCase())
            ? { ...r, urgency: 'completed', daysSinceLastStudy: 0 }
            : r
        );
      });

      const nextState = {
        ...state,
        completedRecords: updatedRecords,
        userProfile: updatedProfile,
        tasks: updatedTasks,
        revisionItems: updatedRevisions,
        activeFocusSession: null,
        isFocusSessionActive: false,
      };

      saveState(nextState);
      return nextState;
    });
  },

  cancelFocusSession: () => {
    set({
      activeFocusSession: null,
      isFocusSessionActive: false,
    });
  },

  // AI Copilot & Snap Solve Actions
  createConversation: (title, initialMessage) => {
    const id = `conv-${Date.now()}`;
    const newConv: AIConversation = {
      id,
      title: title || 'New Study Session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: initialMessage ? [initialMessage] : [],
    };
    set((state) => {
      const conversations = [newConv, ...state.conversations];
      saveState({ ...state, conversations });
      return { conversations, activeConversationId: id };
    });
    return id;
  },

  addMessageToConversation: (conversationId, message) => {
    set((state) => {
      const conversations = state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const messages = [...c.messages, message];
        const isFirstUser = c.messages.length === 0 && message.role === 'user';
        const title = isFirstUser
          ? cleanTitleFromPrompt(message.content)
          : c.title;
        return {
          ...c,
          title,
          updatedAt: new Date().toISOString(),
          messages,
        };
      });
      saveState({ ...state, conversations });
      return { conversations };
    });
  },

  updateMessageInConversation: (conversationId, messageId, updates) => {
    set((state) => {
      const conversations = state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const messages = c.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m));
        return { ...c, messages, updatedAt: new Date().toISOString() };
      });
      saveState({ ...state, conversations });
      return { conversations };
    });
  },

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  deleteConversation: (id) => {
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== id);
      const nextActiveId = conversations[0]?.id || null;
      saveState({ ...state, conversations });
      return { conversations, activeConversationId: nextActiveId };
    });
  },

  renameConversation: (id, title) => {
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
      );
      saveState({ ...state, conversations });
      return { conversations };
    });
  },

  addAIRevisionItem: (topic, subject) => {
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newItem: RevisionItem = {
      id: `rev-ai-${Date.now()}`,
      topic,
      subject: subject || 'General Study',
      lastStudied: today,
      daysSinceLastStudy: 0,
      nextRevisionDate: nextDate,
      intervalStage: 1,
      intervalDays: 1,
      estimatedMinutes: 20,
      urgency: 'upcoming',
      retentionScore: 85,
    };
    set((state) => {
      const revisionItems = [newItem, ...state.revisionItems];
      saveState({ ...state, revisionItems });
      return { revisionItems };
    });
  },

  addAINote: (title, subject, content, formulas) => {
    const newNote: Note = {
      id: `note-ai-${Date.now()}`,
      title,
      subject: subject || 'General',
      category: formulas && formulas.length > 0 ? 'Formula' : 'Quick Note',
      content,
      formulaSnippets: formulas,
      tags: ['FOCUS AI', subject || 'Study'],
      isFavorite: false,
      updatedAt: 'Just now',
    };
    set((state) => {
      const notes = [newNote, ...state.notes];
      saveState({ ...state, notes });
      return { notes };
    });
  },

  setIsAILoading: (loading) => set({ isAILoading: loading }),

  openPracticeMode: (options) => {
    set({
      practiceModalOpen: true,
      practiceInitialSubject: options?.subject || null,
      practiceInitialTopic: options?.topic || null,
      practiceInitialDifficulty: options?.difficulty || 'Medium',
      practiceInitialCount: options?.count || 5,
      practiceInitialSet: options?.practiceSet || null,
      practiceAutoStart: options?.autoStart ?? (options?.practiceSet ? true : false),
    });
  },

  closePracticeMode: () => {
    set({
      practiceModalOpen: false,
      practiceInitialSubject: null,
      practiceInitialTopic: null,
      practiceInitialDifficulty: null,
      practiceInitialCount: null,
      practiceInitialSet: null,
      practiceAutoStart: false,
    });
  },

  scheduleRevisionFromPractice: (params) => {
    const {
      topic,
      subject,
      score,
      total,
      percentage,
      weakConcepts = [],
      strongConcepts = [],
      includeWeakConcepts = true,
    } = params;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let resultOutput: {
      mainItem: RevisionItem;
      weakItems: RevisionItem[];
      intervalDays: number;
      nextRevisionDate: string;
      stage: number;
    } | null = null;

    set((state) => {
      const existingIndex = state.revisionItems.findIndex(
        (r) =>
          r.topic.toLowerCase().trim() === topic.toLowerCase().trim() &&
          r.subject.toLowerCase().trim() === (subject || '').toLowerCase().trim()
      );

      const prevItem = existingIndex >= 0 ? state.revisionItems[existingIndex] : null;
      const currentStage = prevItem?.intervalStage || 1;

      // Spaced Repetition Ebbinghaus schedule calibration based on performance
      let nextStage = 1;
      let intervalDays = 1;
      let urgency: 'due-today' | 'upcoming' | 'completed' = 'upcoming';
      let estimatedMinutes = 20;

      if (percentage >= 80) {
        // High Mastery (>= 80%) -> Advance stage for long-term consolidation
        nextStage = prevItem ? Math.min(5, currentStage + 1) : (percentage >= 90 ? 3 : 2);
        const stageDaysMap: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
        intervalDays = stageDaysMap[nextStage] || 7;
        urgency = 'upcoming';
        estimatedMinutes = 15;
      } else if (percentage >= 60) {
        // Moderate / Competent (60% - 79%) -> Reinforcement interval
        nextStage = Math.max(2, Math.min(3, currentStage));
        intervalDays = nextStage === 3 ? 7 : 3;
        urgency = 'upcoming';
        estimatedMinutes = 20;
      } else {
        // Low Performance / Cognitive Decay Risk (< 60%) -> Urgent immediate retrieval
        nextStage = 1;
        intervalDays = 1;
        urgency = percentage < 45 ? 'due-today' : 'upcoming';
        estimatedMinutes = 25;
      }

      const nextDateObj = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
      const nextRevisionDate = nextDateObj.toISOString().split('T')[0];

      const mainItem: RevisionItem = {
        id: prevItem?.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: subject || 'General',
        topic,
        chapterId: prevItem?.chapterId,
        lastStudied: todayStr,
        daysSinceLastStudy: 0,
        estimatedMinutes,
        urgency,
        intervalStage: nextStage,
      };

      const weakItems: RevisionItem[] = [];
      if (includeWeakConcepts && weakConcepts && weakConcepts.length > 0) {
        weakConcepts.forEach((wc, idx) => {
          if (wc.toLowerCase().trim() !== topic.toLowerCase().trim()) {
            weakItems.push({
              id: `rev-weak-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
              subject: subject || 'General',
              topic: wc,
              lastStudied: todayStr,
              daysSinceLastStudy: 0,
              estimatedMinutes: 15,
              urgency: 'due-today',
              intervalStage: 1,
            });
          }
        });
      }

      let updatedRevisions = [...state.revisionItems];
      if (existingIndex >= 0) {
        updatedRevisions[existingIndex] = mainItem;
      } else {
        updatedRevisions = [mainItem, ...updatedRevisions];
      }

      weakItems.forEach((wi) => {
        const idx = updatedRevisions.findIndex(
          (r) =>
            r.topic.toLowerCase().trim() === wi.topic.toLowerCase().trim() &&
            r.subject.toLowerCase().trim() === wi.subject.toLowerCase().trim()
        );
        if (idx >= 0) {
          updatedRevisions[idx] = {
            ...updatedRevisions[idx],
            daysSinceLastStudy: 0,
            lastStudied: todayStr,
            urgency: 'due-today',
            intervalStage: 1,
          };
        } else {
          updatedRevisions.unshift(wi);
        }
      });

      saveState({ ...state, revisionItems: updatedRevisions });

      resultOutput = {
        mainItem,
        weakItems,
        intervalDays,
        nextRevisionDate,
        stage: nextStage,
      };

      return { revisionItems: updatedRevisions };
    });

    return (
      resultOutput || {
        mainItem: {
          id: `rev-${Date.now()}`,
          subject: subject || 'General',
          topic,
          lastStudied: todayStr,
          daysSinceLastStudy: 0,
          estimatedMinutes: 20,
          urgency: 'upcoming',
          intervalStage: 1,
        },
        weakItems: [],
        intervalDays: 1,
        nextRevisionDate: todayStr,
        stage: 1,
      }
    );
  },

  recordPracticeResult: (result) => {
    set((state) => {
      const recentPracticeResults = [result, ...(state.recentPracticeResults || [])].slice(0, 20);
      saveState({ ...state, recentPracticeResults });
      return { recentPracticeResults };
    });
  },

  resetToDemoData: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      userProfile: initialUserProfile,
      subjects: initialSubjects,
      exams: initialExams,
      tasks: initialTasks,
      revisionItems: initialRevisionItems,
      plannedSessions: initialPlannedSessions,
      completedRecords: initialCompletedRecords,
      notes: initialNotes,
      conversations: INITIAL_DEMO_CONVERSATIONS,
      activeConversationId: INITIAL_DEMO_CONVERSATIONS[0].id,
      recentPracticeResults: [],
      isAILoading: false,
      currentView: 'dashboard',
    });
  },

  exportDataJson: () => {
    const state = get();
    const exportObj = {
      userProfile: state.userProfile,
      subjects: state.subjects,
      exams: state.exams,
      tasks: state.tasks,
      revisionItems: state.revisionItems,
      plannedSessions: state.plannedSessions,
      completedRecords: state.completedRecords,
      notes: state.notes,
      conversations: state.conversations,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportObj, null, 2);
  },

  importDataJson: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.userProfile && data.subjects && data.tasks) {
        set({
          userProfile: data.userProfile,
          subjects: data.subjects,
          exams: data.exams || [],
          tasks: data.tasks || [],
          revisionItems: data.revisionItems || [],
          plannedSessions: data.plannedSessions || [],
          completedRecords: data.completedRecords || [],
          notes: data.notes || [],
          conversations: data.conversations || INITIAL_DEMO_CONVERSATIONS,
          activeConversationId: data.conversations?.[0]?.id || INITIAL_DEMO_CONVERSATIONS[0].id,
        });
        saveState(get());
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  },
}));

function saveState(state: Partial<FocusState>) {
  try {
    const toSave = {
      userProfile: state.userProfile,
      subjects: state.subjects,
      exams: state.exams,
      tasks: state.tasks,
      revisionItems: state.revisionItems,
      plannedSessions: state.plannedSessions,
      completedRecords: state.completedRecords,
      notes: state.notes,
      conversations: state.conversations,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}
