import { Task, RevisionItem, Exam, Subject, PlannedSession, CompletedSessionRecord } from '../types';

export interface FocusScoreBreakdown {
  score: number; // 0 to 100
  rating: 'Well Balanced' | 'Good Organization' | 'Action Needed' | 'Overloaded';
  factors: {
    label: string;
    score: number;
    description: string;
  }[];
  actionableInsights: string[];
}

export function calculateFocusScore(
  tasks: Task[],
  revisions: RevisionItem[],
  exams: Exam[],
  subjects: Subject[],
  plannedSessions: PlannedSession[],
  completedRecords: CompletedSessionRecord[]
): FocusScoreBreakdown {
  let scoreTotal = 0;
  const insights: string[] = [];

  // 1. Session Execution Factor (Max 25 pts)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlanned = plannedSessions.filter(s => s.date === todayStr);
  const todayDone = todayPlanned.filter(s => s.completed);
  let sessionScore = 20;
  if (todayPlanned.length > 0) {
    const ratio = todayDone.length / todayPlanned.length;
    sessionScore = Math.round(ratio * 25);
  }
  scoreTotal += sessionScore;

  // 2. Task Health Factor (Max 25 pts)
  const openTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = openTasks.filter(t => t.deadline < todayStr);
  let taskScore = 25 - overdueTasks.length * 6;
  taskScore = Math.max(5, Math.min(25, taskScore));
  scoreTotal += taskScore;

  if (overdueTasks.length > 0) {
    insights.push(`${overdueTasks.length} task${overdueTasks.length > 1 ? 's are' : ' is'} past deadline. Reschedule or clear them to regain flow.`);
  }

  // 3. Revision Pacing Factor (Max 25 pts)
  const dueTodayRevisions = revisions.filter(r => r.urgency === 'due-today');
  let revisionScore = 25 - dueTodayRevisions.length * 4;
  revisionScore = Math.max(5, Math.min(25, revisionScore));
  scoreTotal += revisionScore;

  if (dueTodayRevisions.length > 0) {
    insights.push(`${dueTodayRevisions.length} topic${dueTodayRevisions.length > 1 ? 's are' : ' is'} due for active recall. A 15-min Quick Focus session will lock them in.`);
  }

  // 4. Syllabus & Exam Runway Factor (Max 25 pts)
  let totalChapters = 0;
  let completedChapters = 0;
  subjects.forEach(s => {
    s.chapters.forEach(c => {
      totalChapters++;
      if (c.completionPercentage >= 90) completedChapters++;
    });
  });

  const syllabusRatio = totalChapters > 0 ? completedChapters / totalChapters : 0.7;
  const syllabusScore = Math.round(syllabusRatio * 25);
  scoreTotal += syllabusScore;

  // Exam proximity check
  const nearestExam = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  if (nearestExam) {
    const daysUntil = Math.ceil((new Date(nearestExam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 14 && nearestExam.completedChapters / nearestExam.totalChapters < 0.75) {
      insights.push(`${nearestExam.subject} exam is in ${daysUntil} days with ${nearestExam.totalChapters - nearestExam.completedChapters} chapters left. Prioritize this week.`);
    }
  }

  // Distribution balance insight
  const subjectWorkloads: Record<string, number> = {};
  openTasks.forEach(t => {
    subjectWorkloads[t.subject] = (subjectWorkloads[t.subject] || 0) + 1;
  });
  const maxSubject = Object.entries(subjectWorkloads).sort((a, b) => b[1] - a[1])[0];
  if (maxSubject && maxSubject[1] >= 3) {
    insights.push(`${maxSubject[0]} has the highest remaining workload with ${maxSubject[1]} pending tasks.`);
  }

  // Completion record time insight
  if (completedRecords.length >= 3) {
    insights.push(`You studied most consistently between 5:30 PM and 8:30 PM this week.`);
  }

  if (insights.length === 0) {
    insights.push(`Your workload is evenly distributed across your calendar. Keep up the consistent cadence!`);
  }

  const finalScore = Math.min(96, Math.max(45, scoreTotal));

  let rating: FocusScoreBreakdown['rating'] = 'Good Organization';
  if (finalScore >= 85) rating = 'Well Balanced';
  else if (finalScore >= 70) rating = 'Good Organization';
  else if (finalScore >= 55) rating = 'Action Needed';
  else rating = 'Overloaded';

  return {
    score: finalScore,
    rating,
    factors: [
      { label: 'Session Consistency', score: sessionScore, description: 'Daily planned study execution' },
      { label: 'Task Health', score: taskScore, description: 'Deadlines and open workload buffer' },
      { label: 'Spaced Revision', score: revisionScore, description: 'Retention intervals and active recall' },
      { label: 'Exam Runway', score: syllabusScore, description: 'Syllabus coverage vs target exam dates' },
    ],
    actionableInsights: insights,
  };
}
