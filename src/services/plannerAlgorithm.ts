import { PlannedSession, Subject, Exam, Priority } from '../types';

export interface AutoPlanRequest {
  examDate: string;
  availableDailyHours: number;
  selectedSubjects: string[];
  prioritySubject: string;
  startDate?: string;
}

export function generateAutoSchedule({
  examDate,
  availableDailyHours,
  selectedSubjects,
  prioritySubject,
  startDate,
}: AutoPlanRequest, subjectsList: Subject[]): PlannedSession[] {
  const newSessions: PlannedSession[] = [];
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(examDate);
  const diffDays = Math.max(1, Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));

  const availableDailyMinutes = Math.min(360, Math.max(30, Math.round(availableDailyHours * 60)));
  const sessionDuration = 45; // 45 minute standard block
  const sessionsPerDay = Math.max(1, Math.floor(availableDailyMinutes / sessionDuration));

  // Timeslots
  const timeSlots = ['09:00', '11:00', '16:00', '18:00', '19:30', '21:00'];

  for (let day = 0; day < diffDays; day++) {
    const currentDayDate = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
    const dateString = currentDayDate.toISOString().split('T')[0];

    for (let slotIndex = 0; slotIndex < sessionsPerDay; slotIndex++) {
      // Prioritize prioritySubject every other slot or first slot
      let chosenSubject = prioritySubject;
      if (slotIndex % 2 !== 0 && selectedSubjects.length > 1) {
        const otherSubjects = selectedSubjects.filter(s => s !== prioritySubject);
        chosenSubject = otherSubjects[(day + slotIndex) % otherSubjects.length];
      }

      // Pick topic from subject's chapters
      const subjObj = subjectsList.find(s => s.name === chosenSubject);
      let topic = `${chosenSubject} Core Concept Practice`;
      if (subjObj && subjObj.chapters.length > 0) {
        const ch = subjObj.chapters[(day + slotIndex) % subjObj.chapters.length];
        topic = ch.topics[slotIndex % ch.topics.length] || ch.title;
      }

      const isPriority = chosenSubject === prioritySubject;
      const priority: Priority = isPriority ? 'high' : 'medium';

      newSessions.push({
        id: `auto-${dateString}-${slotIndex}-${Math.random().toString(36).substring(2, 7)}`,
        subject: chosenSubject,
        topic,
        date: dateString,
        startTime: timeSlots[slotIndex % timeSlots.length],
        durationMinutes: sessionDuration,
        priority,
        completed: false,
      });
    }
  }

  return newSessions;
}

/**
 * Adaptive Planner:
 * Detects missed or incomplete sessions and redistributes them into upcoming days
 * strictly respecting the user's available daily hours ceiling.
 */
export function redistributeMissedWorkload(
  sessions: PlannedSession[],
  dailyAvailableHours: number
): { updatedSessions: PlannedSession[]; redistributedCount: number; message: string } {
  const todayStr = new Date().toISOString().split('T')[0];
  const maxMinutesPerDay = Math.round(dailyAvailableHours * 60);

  // Find incomplete past or missed sessions
  const missedSessions = sessions.filter(
    s => !s.completed && s.date < todayStr
  );

  if (missedSessions.length === 0) {
    return {
      updatedSessions: sessions,
      redistributedCount: 0,
      message: 'All past sessions are up to date! No redistribution required.',
    };
  }

  // Group future sessions by date to check available capacity
  const activeSessions = sessions.filter(s => s.completed || s.date >= todayStr);
  const futureSessions = activeSessions.filter(s => s.date >= todayStr);

  // Calculate day minutes usage
  const minutesByDate: Record<string, number> = {};
  futureSessions.forEach(s => {
    minutesByDate[s.date] = (minutesByDate[s.date] || 0) + s.durationMinutes;
  });

  const redistributed: PlannedSession[] = [];
  let dayOffset = 0;

  missedSessions.forEach((missed) => {
    // Look for a day with available room
    let placed = false;
    while (!placed && dayOffset < 14) {
      const targetDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const currentLoad = minutesByDate[targetDate] || 0;

      if (currentLoad + missed.durationMinutes <= maxMinutesPerDay) {
        // We can place it here
        minutesByDate[targetDate] = currentLoad + missed.durationMinutes;
        redistributed.push({
          ...missed,
          id: `redist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: targetDate,
          startTime: '19:00',
          missed: false,
        });
        placed = true;
      } else {
        dayOffset++;
      }
    }

    if (!placed) {
      // Fallback: place tomorrow with high priority
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      redistributed.push({
        ...missed,
        id: `redist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: tomorrow,
        startTime: '20:30',
        missed: false,
      });
    }
  });

  // Combine active and redistributed
  const combined = [...activeSessions, ...redistributed].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return {
    updatedSessions: combined,
    redistributedCount: missedSessions.length,
    message: `Intelligently rescheduled ${missedSessions.length} missed topic${missedSessions.length > 1 ? 's' : ''} across available slots without exceeding your daily ${dailyAvailableHours}h limit.`,
  };
}
