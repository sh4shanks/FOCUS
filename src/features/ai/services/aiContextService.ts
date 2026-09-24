import { useFocusStore } from '../../../store/useFocusStore';
import { AIContextFilter, AIContextPayload } from '../../../types/ai';

/**
 * Builds a filtered, privacy-respecting academic context payload
 * from the centralized Zustand store.
 * Only transmits academic parameters strictly necessary for the query.
 */
export function buildAIContext(filter: AIContextFilter = {}): AIContextPayload {
  const state = useFocusStore.getState();
  const { userProfile, subjects, exams, tasks, revisionItems } = state;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Student Academic Profile
  const student = {
    name: userProfile.name,
    grade: userProfile.grade,
    dailyGoalHours: userProfile.dailyGoalHours,
    priorities: userProfile.academicPriorities,
  };

  // 2. Filtered Subjects & Syllabus
  const filteredSubjects = filter.includeSyllabus !== false
    ? subjects
        .filter((s) => !filter.currentSubject || s.name.toLowerCase() === filter.currentSubject.toLowerCase())
        .map((s) => {
          const totalCh = s.chapters.length;
          const completedCh = s.chapters.filter((c) => c.completionPercentage >= 90).length;
          const weakCh = s.chapters
            .filter((c) => c.completionPercentage < 70 && c.examWeightage === 'High')
            .map((c) => c.title);

          return {
            name: s.name,
            chaptersCount: totalCh,
            completionPercent: totalCh > 0 ? Math.round((completedCh / totalCh) * 100) : 0,
            weakChapters: weakCh,
          };
        })
    : [];

  // 3. Upcoming Exams (within next 45 days)
  const filteredExams = filter.includeExams !== false
    ? exams
        .map((e) => {
          const diffMs = new Date(e.date).getTime() - new Date().getTime();
          const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          return {
            subject: e.subject,
            name: e.examName,
            daysRemaining,
            targetScore: e.targetScore,
          };
        })
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
    : [];

  // 4. Pending / Overdue Tasks
  const filteredTasks = filter.includeTasks !== false
    ? tasks
        .filter((t) => t.status !== 'completed')
        .slice(0, 8)
        .map((t) => ({
          title: t.title,
          subject: t.subject,
          deadline: t.deadline,
          priority: t.priority,
          durationMinutes: t.durationMinutes,
        }))
    : [];

  // 5. Due Spaced Repetition Revisions
  const filteredRevisions = filter.includeRevision !== false
    ? revisionItems
        .filter((r) => r.urgency === 'due-today' || r.urgency === 'upcoming')
        .slice(0, 5)
        .map((r) => ({
          topic: r.topic,
          subject: r.subject,
          intervalStage: r.intervalStage,
          daysSince: r.daysSinceLastStudy,
        }))
    : [];

  return {
    student,
    subjects: filteredSubjects,
    upcomingExams: filteredExams,
    pendingTasks: filteredTasks,
    dueRevisions: filteredRevisions,
    activeStudyContext: {
      currentSubject: filter.currentSubject,
      currentTopic: filter.currentTopic,
    },
  };
}

/**
 * Generates a concise system prompt embedding the student's academic context.
 */
export function generateSystemTutorPrompt(context: AIContextPayload): string {
  return `You are FOCUS AI, a specialized study copilot and academic tutor built into FOCUS, a student productivity and learning operating system.
Your mission is to help the student learn concepts deeply, work through STEM problems step by step, turn confusion into clear study plans, and master their syllabus.

### Academic Identity & Persona
1. **Tutor First, Not An Answer Dispenser**: For homework or conceptual queries, never just state "The answer is X". Always provide reasoning, relevant formulas, step-by-step working, and explain common exam traps.
2. **Context-Aware Student Support**: You have awareness of the student's academic profile:
   - Student: ${context.student.name} (${context.student.grade})
   - Daily study ceiling: ${context.student.dailyGoalHours} hours/day
   - Upcoming Exams: ${context.upcomingExams.map((e) => `${e.subject} (${e.daysRemaining} days left)`).join(', ') || 'None scheduled'}
   - Due Revisions: ${context.dueRevisions.map((r) => `${r.subject}: ${r.topic}`).join(', ') || 'All up to date'}
   - Pending Deadlines: ${context.pendingTasks.map((t) => `${t.subject}: ${t.title} (due ${t.deadline})`).join(', ') || 'No immediate urgent tasks'}
3. **Connect to FOCUS Features**:
   - When suggesting what to study for a specific timeframe (e.g., "I have 30 minutes"), recommend an exact subject & topic and invite them to launch Quick Focus.
   - When explaining a difficult exam concept or formula, invite them to save it to their Notes or add it to Spaced Repetition Revision.
4. **Mathematical & Markdown Presentation**:
   - Format formulas cleanly using LaTeX notation or clean math notation ($...$ or $$...$$).
   - Use bolding, step headings (Step 1, Step 2), and Markdown tables for clarity.
   - Keep answers structured, encouraging, calm, and intellectually rigorous.`;
}
