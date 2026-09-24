import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  BookmarkPlus,
  Trophy,
  AlertTriangle,
  Flame,
  BookOpen,
  Sliders,
  ChevronRight,
  HelpCircle,
  Clock,
  Check,
  Calendar,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { useFocusStore } from '../../../store/useFocusStore';
import { PracticeSet, PracticeQuestion, PracticeConceptAnalysis, PracticeResultRecord } from '../../../types/ai';
import { aiProvider } from '../services/aiProvider';

interface PracticeModeProps {
  initialSubject?: string | null;
  initialTopic?: string | null;
  initialDifficulty?: 'Easy' | 'Medium' | 'Hard' | null;
  initialCount?: number | null;
  initialPracticeSet?: PracticeSet | null;
  autoStart?: boolean;
  isModal?: boolean;
  onClose?: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  initialSubject,
  initialTopic,
  initialDifficulty,
  initialCount,
  initialPracticeSet,
  autoStart = false,
  isModal = false,
  onClose,
}) => {
  const {
    subjects,
    recentPracticeResults,
    recordPracticeResult,
    scheduleRevisionFromPractice,
    addAIRevisionItem,
    openQuickFocus,
    setCurrentView,
  } = useFocusStore();

  // Setup state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (initialSubject) {
      const match = subjects.find(
        (s) => s.name.toLowerCase() === initialSubject.toLowerCase() || s.id === initialSubject
      );
      if (match) return match.id;
    }
    return subjects[0]?.id || '';
  });

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    if (initialTopic) return initialTopic;
    return activeSubject?.chapters[0]?.title || 'Key Concepts';
  });

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(
    initialDifficulty || 'Medium'
  );
  const [questionCount, setQuestionCount] = useState<number>(initialCount || 5);
  const [customCountInput, setCustomCountInput] = useState<string>('');
  const [isCustomCount, setIsCustomCount] = useState(false);

  // Flow states: 'setup' | 'loading' | 'practicing' | 'results'
  const [flowState, setFlowState] = useState<'setup' | 'loading' | 'practicing' | 'results'>('setup');

  // Practice state
  const [activePracticeSet, setActivePracticeSet] = useState<PracticeSet | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [resultsAnalysis, setResultsAnalysis] = useState<{
    correctCount: number;
    total: number;
    percentage: number;
    concepts: PracticeConceptAnalysis[];
    weakConcepts: string[];
    strongConcepts: string[];
  } | null>(null);

  const [savedToRevision, setSavedToRevision] = useState(false);
  const [includeWeakSubtopics, setIncludeWeakSubtopics] = useState(true);
  const [scheduledRevisionInfo, setScheduledRevisionInfo] = useState<{
    intervalDays: number;
    nextRevisionDate: string;
    stage: number;
    weakCount: number;
  } | null>(null);

  // If initialPracticeSet is provided, load it and auto-start if requested
  useEffect(() => {
    if (initialPracticeSet) {
      setActivePracticeSet(initialPracticeSet);
      setSelectedTopic(initialPracticeSet.topic);
      if (initialPracticeSet.difficulty) {
        setDifficulty(initialPracticeSet.difficulty);
      }
      setQuestionCount(initialPracticeSet.questions.length);
      if (autoStart) {
        setFlowState('practicing');
        setCurrentIdx(0);
        setSelectedOption(null);
        setHasSubmitted(false);
        setUserAnswers({});
        setResultsAnalysis(null);
        setSavedToRevision(false);
        setScheduledRevisionInfo(null);
      }
    }
  }, [initialPracticeSet, autoStart]);

  // When subject changes in setup, pick first topic of that subject
  useEffect(() => {
    if (activeSubject && activeSubject.chapters.length > 0) {
      if (!activeSubject.chapters.some((c) => c.title === selectedTopic)) {
        setSelectedTopic(activeSubject.chapters[0].title);
      }
    }
  }, [selectedSubjectId]);

  // If initial subject/topic provided on mount, auto-populate
  useEffect(() => {
    if (initialSubject) {
      const match = subjects.find(
        (s) => s.name.toLowerCase() === initialSubject.toLowerCase() || s.id === initialSubject
      );
      if (match) setSelectedSubjectId(match.id);
    }
    if (initialTopic) {
      setSelectedTopic(initialTopic);
    }
    if (initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
    if (initialCount) {
      setQuestionCount(initialCount);
    }
  }, [initialSubject, initialTopic, initialDifficulty, initialCount]);

  // Start Practice action
  const handleStartPractice = async () => {
    const finalCount = isCustomCount
      ? Math.max(1, Math.min(25, parseInt(customCountInput) || 5))
      : questionCount;

    setFlowState('loading');

    const pSet = await aiProvider.generatePractice({
      subject: activeSubject?.name || 'General',
      topic: selectedTopic,
      difficulty,
      count: finalCount,
    });

    setActivePracticeSet(pSet);
    setCurrentIdx(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setUserAnswers({});
    setFlowState('practicing');
  };

  const currentQ: PracticeQuestion | undefined = activePracticeSet?.questions[currentIdx];
  const isCurrentCorrect = hasSubmitted && selectedOption === currentQ?.correctAnswer;

  const handleSelectOption = (opt: string) => {
    if (hasSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ) return;
    setHasSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [currentIdx]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (!activePracticeSet) return;
    if (currentIdx < activePracticeSet.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    } else {
      finishPracticeSession();
    }
  };

  const finishPracticeSession = () => {
    if (!activePracticeSet) return;

    let correctCount = 0;
    const conceptMap: Record<string, { correct: number; total: number }> = {};

    activePracticeSet.questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      const isOk = ans === q.correctAnswer;
      if (isOk) correctCount++;

      const tag = q.conceptTag || activePracticeSet.topic;
      if (!conceptMap[tag]) {
        conceptMap[tag] = { correct: 0, total: 0 };
      }
      conceptMap[tag].total++;
      if (isOk) conceptMap[tag].correct++;
    });

    const total = activePracticeSet.questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const concepts: PracticeConceptAnalysis[] = Object.entries(conceptMap).map(([concept, data]) => ({
      concept,
      correctCount: data.correct,
      totalCount: data.total,
      isStrong: data.correct / data.total >= 0.7,
    }));

    const weakConcepts = concepts.filter((c) => !c.isStrong).map((c) => c.concept);
    const strongConcepts = concepts.filter((c) => c.isStrong).map((c) => c.concept);

    setResultsAnalysis({
      correctCount,
      total,
      percentage,
      concepts,
      weakConcepts,
      strongConcepts,
    });

    // Record in store for intelligent recommendations
    const record: PracticeResultRecord = {
      id: `prac-res-${Date.now()}`,
      subject: activePracticeSet.subject,
      topic: activePracticeSet.topic,
      difficulty: activePracticeSet.difficulty || 'Medium',
      score: correctCount,
      total,
      percentage,
      weakConcepts,
      strongConcepts,
      timestamp: new Date().toISOString(),
    };
    recordPracticeResult(record);

    setFlowState('results');
  };

  // Calibrated Spaced Repetition Preview based on actual score
  const schedulePreview = React.useMemo(() => {
    if (!resultsAnalysis || !activePracticeSet) return null;
    const pct = resultsAnalysis.percentage;
    let stage = 1;
    let intervalDays = 1;
    let stageLabel = 'Urgent Review';
    let urgencyColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    let rationale = 'Immediate retrieval scheduled for tomorrow to halt memory decay.';

    if (pct >= 80) {
      stage = 3;
      intervalDays = 7;
      stageLabel = 'Consolidation Stage 3';
      urgencyColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      rationale = 'High active recall mastery! Spaced interval extended to 7 days for long-term retention.';
    } else if (pct >= 60) {
      stage = 2;
      intervalDays = 3;
      stageLabel = 'Reinforcement Stage 2';
      urgencyColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      rationale = 'Solid foundation. 3-day spaced retrieval scheduled to reinforce concept retention.';
    }

    const nextDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return { stage, intervalDays, stageLabel, urgencyColor, rationale, nextDate };
  }, [resultsAnalysis, activePracticeSet]);

  const handleAddToRevision = () => {
    if (!resultsAnalysis || !activePracticeSet) return;

    const res = scheduleRevisionFromPractice({
      topic: activePracticeSet.topic,
      subject: activePracticeSet.subject,
      score: resultsAnalysis.correctCount,
      total: resultsAnalysis.total,
      percentage: resultsAnalysis.percentage,
      weakConcepts: resultsAnalysis.weakConcepts,
      strongConcepts: resultsAnalysis.strongConcepts,
      includeWeakConcepts: includeWeakSubtopics,
    });

    setScheduledRevisionInfo({
      intervalDays: res.intervalDays,
      nextRevisionDate: res.nextRevisionDate,
      stage: res.stage,
      weakCount: res.weakItems.length,
    });
    setSavedToRevision(true);
  };

  const handleStartReviewSession = (targetTopic?: string) => {
    const topic = targetTopic || resultsAnalysis?.weakConcepts[0] || activePracticeSet?.topic || 'Practice Review';
    const subj = activePracticeSet?.subject || activeSubject?.name || 'General';
    if (onClose) onClose();
    openQuickFocus(20, `Practice Review: ${topic}`, subj);
  };

  const liveCorrectCount = Object.entries(userAnswers).filter(
    ([idx, ans]) => activePracticeSet?.questions[Number(idx)]?.correctAnswer === ans
  ).length;
  const liveAnsweredCount = Object.keys(userAnswers).length;
  const liveIncorrectCount = liveAnsweredCount - liveCorrectCount;

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6'}`}>
      <div className="rounded-2xl border border-white/10 bg-[#0d0f19] shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Practice Mode
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Adaptive Active Recall
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diagnostic questions grounded in your syllabus with instant conceptual feedback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {flowState === 'practicing' && (
              <button
                onClick={() => setFlowState('setup')}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
              >
                Change Topic
              </button>
            )}
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 1. SETUP SCREEN */}
        {flowState === 'setup' && (
          <div className="p-5 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Configure Your Practice Session</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select from your existing curriculum and choose your desired difficulty.
              </p>
            </div>

            {/* Step 1: Select Subject */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                1. Select Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {subjects.map((s) => {
                  const isSelected = s.id === selectedSubjectId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: s.color || '#38bdf8' }}
                        />
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs sm:text-sm font-semibold text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.chapters.length} syllabus topics
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Topic / Chapter */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                2. Select Syllabus Topic / Chapter
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {activeSubject?.chapters.map((ch) => {
                  const isSelected = selectedTopic === ch.title;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedTopic(ch.title)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-white/[0.02] border-white/[0.07] text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-white truncate">
                          {ch.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{ch.completionPercentage}% complete</span>
                          <span>•</span>
                          <span
                            className={
                              ch.difficulty === 'Hard'
                                ? 'text-rose-400'
                                : ch.difficulty === 'Medium'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {ch.difficulty}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Difficulty & Question Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  3. Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                        difficulty === lvl
                          ? 'bg-purple-500/20 border-purple-500/50 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div>{lvl}</div>
                      <div className="text-[9px] text-slate-400 font-normal mt-0.5">
                        {lvl === 'Easy' ? 'Fundamental' : lvl === 'Medium' ? 'Exam-Level' : 'Multi-Step'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  4. Question Count
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setIsCustomCount(false);
                        setQuestionCount(cnt);
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-mono text-center transition-all ${
                        !isCustomCount && questionCount === cnt
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                  <button
                    onClick={() => setIsCustomCount(true)}
                    className={`py-2 px-2 rounded-xl border text-xs text-center transition-all ${
                      isCustomCount
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold'
                        : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {isCustomCount && (
                  <div className="pt-1">
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={customCountInput}
                      onChange={(e) => setCustomCountInput(e.target.value)}
                      placeholder="Enter number (1-25)"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Ready to test <strong className="text-white">{selectedTopic}</strong> ({difficulty} difficulty)
                </span>
              </div>

              <button
                onClick={handleStartPractice}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-98"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. LOADING STATE */}
        {flowState === 'loading' && (
          <div className="py-20 px-4 text-center space-y-4">
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 animate-spin" />
              <BrainCircuit className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Synthesizing Diagnostic Questions...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Grounding questions in {selectedTopic} ({activeSubject?.name}) with step-by-step conceptual explanations.
              </p>
            </div>
          </div>
        )}

        {/* 3. PRACTICING STATE */}
        {flowState === 'practicing' && currentQ && (
          <div className="p-5 sm:p-7 space-y-5">
            {/* Top Stats Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-cyan-300">
                  {activePracticeSet?.subject}
                </span>
                <span className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                  {activePracticeSet?.topic}
                </span>
                {currentQ.conceptTag && (
                  <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {currentQ.conceptTag}
                  </span>
                )}
              </div>

              {/* Progress counter & correct tally */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">
                  Question <strong className="text-white font-mono">{currentIdx + 1}</strong> of{' '}
                  <span className="font-mono">{activePracticeSet?.questions.length}</span>
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> {liveCorrectCount}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <XCircle className="w-3 h-3" /> {liveIncorrectCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                style={{
                  width: `${((currentIdx + (hasSubmitted ? 1 : 0)) / (activePracticeSet?.questions.length || 1)) * 100}%`,
                }}
              />
            </div>

            {/* Question Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-inner">
              <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                {currentQ.question}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options?.map((option, optIdx) => {
                const optionLetter = String.fromCharCode(65 + optIdx);
                const isSelected = selectedOption === option;
                const isAnswer = hasSubmitted && option === currentQ.correctAnswer;
                const isWrongSelected = hasSubmitted && isSelected && !isAnswer;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(option)}
                    disabled={hasSubmitted}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                      isAnswer
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                        : isWrongSelected
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                        : isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                        : 'bg-white/[0.02] border-white/[0.07] text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isAnswer
                            ? 'bg-emerald-500 text-slate-950'
                            : isWrongSelected
                            ? 'bg-rose-500 text-white'
                            : isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {optionLetter}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isWrongSelected && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Submit / Next Button Bar */}
            {!hasSubmitted ? (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-semibold text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              /* Learning-First Feedback Reveal */
              <div className="space-y-3 pt-2">
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                    isCurrentCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="font-bold flex items-center gap-2 mb-2">
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Correct.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-300">Not quite.</span>
                        <span className="text-slate-300 font-normal text-xs">
                          The correct answer is <strong className="text-white font-semibold">{currentQ.correctAnswer}</strong>.
                        </span>
                      </>
                    )}
                  </div>

                  {/* Standard Explanation */}
                  <p className="text-slate-200 text-xs sm:text-sm">{currentQ.explanation}</p>

                  {/* Learning-First Deep Rationale Grid */}
                  {(currentQ.why || currentQ.remember || currentQ.commonMistake) && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                      {currentQ.why && (
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                          <span className="font-bold text-cyan-300 block mb-1">Why?</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed">{currentQ.why}</span>
                        </div>
                      )}
                      {currentQ.remember && (
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                          <span className="font-bold text-amber-300 block mb-1">Remember</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed font-mono">
                            {currentQ.remember}
                          </span>
                        </div>
                      )}
                      {currentQ.commonMistake && (
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                          <span className="font-bold text-rose-300 block mb-1">Common Mistake</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed">
                            {currentQ.commonMistake}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <span>
                      {currentIdx < (activePracticeSet?.questions.length || 0) - 1
                        ? 'Next Question'
                        : 'View Results'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. RESULTS SCREEN */}
        {flowState === 'results' && resultsAnalysis && activePracticeSet && (
          <div className="p-5 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-[0_0_25px_rgba(168,85,247,0.25)]">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Practice Complete</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {activePracticeSet.topic} • {activePracticeSet.subject} ({activePracticeSet.difficulty} difficulty)
                </p>
              </div>

              <div className="inline-flex flex-col items-center p-4 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[220px]">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
                  {resultsAnalysis.correctCount} / {resultsAnalysis.total}
                </div>
                <span className="text-xs text-slate-400 mt-0.5">
                  {resultsAnalysis.percentage}% Accuracy
                </span>
              </div>
            </div>

            {/* Topic Analysis from Question Metadata */}
            <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Topic Analysis
                </span>
                <span className="text-[11px] text-slate-400">Grounded in evaluated concepts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {resultsAnalysis.concepts.map((c) => (
                  <div
                    key={c.concept}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{c.concept}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {c.correctCount} of {c.totalCount} correct
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.isStrong
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {c.isStrong ? 'Strong' : 'Needs Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Insights: What you know vs Revise next */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> What You Know
                </span>
                {resultsAnalysis.strongConcepts.length > 0 ? (
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {resultsAnalysis.strongConcepts.map((sc) => (
                      <li key={sc}>✓ {sc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-[11px]">Keep practicing to build your strong concepts.</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <span className="font-bold text-rose-300 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Revise Next
                </span>
                {resultsAnalysis.weakConcepts.length > 0 ? (
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {resultsAnalysis.weakConcepts.map((wc) => (
                      <li key={wc}>⚠ {wc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-300 text-[11px]">All evaluated concepts met mastery threshold!</p>
                )}
              </div>
            </div>

            {/* 4. SPACED REPETITION INTEGRATION PANEL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-purple-950/30 border border-cyan-500/30 space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Spaced Repetition Integration
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Schedules active recall intervals calibrated to your{' '}
                    <span className="text-cyan-300 font-bold">{resultsAnalysis.percentage}%</span> score.
                  </p>
                </div>

                {schedulePreview && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${schedulePreview.urgencyColor}`}>
                    {schedulePreview.stageLabel}
                  </span>
                )}
              </div>

              {/* Calculated Interval & Date Metrics */}
              {schedulePreview && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Calculated Interval</span>
                    <span className="text-sm font-bold text-cyan-300">
                      +{schedulePreview.intervalDays} {schedulePreview.intervalDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Next Retrieval Date</span>
                    <span className="text-sm font-bold text-white">{schedulePreview.nextDate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Target Revision Time</span>
                    <span className="text-sm font-bold text-amber-300">
                      {resultsAnalysis.percentage >= 80 ? '15 mins (Speed)' : resultsAnalysis.percentage >= 60 ? '20 mins' : '25 mins (Deep)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Rationale explanation */}
              {schedulePreview && (
                <p className="text-[11px] text-slate-400 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  💡 {schedulePreview.rationale}
                </p>
              )}

              {/* Inclusion checklist */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Schedule <strong className="text-white">{activePracticeSet.topic}</strong> in Spaced Repetition ({schedulePreview?.intervalDays}d interval)
                  </span>
                </div>

                {resultsAnalysis.weakConcepts.length > 0 && (
                  <label className="flex items-start gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={includeWeakSubtopics}
                      onChange={(e) => setIncludeWeakSubtopics(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-0"
                    />
                    <span>
                      Also add <strong className="text-rose-300">{resultsAnalysis.weakConcepts.length} weak sub-concept(s)</strong> for priority review tomorrow:
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {resultsAnalysis.weakConcepts.join(', ')}
                      </span>
                    </span>
                  </label>
                )}
              </div>

              {/* Add to Revision CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleAddToRevision}
                  disabled={savedToRevision}
                  className={`w-full sm:flex-1 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    savedToRevision
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>
                    {savedToRevision
                      ? `Added to Revision (Scheduled for ${scheduledRevisionInfo?.nextRevisionDate || schedulePreview?.nextDate} • Stage ${scheduledRevisionInfo?.stage || schedulePreview?.stage}) ✓`
                      : 'Add to Revision'}
                  </span>
                </button>

                {savedToRevision && (
                  <button
                    onClick={() => {
                      if (onClose) onClose();
                      setCurrentView('revision');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View in Revision Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleStartPractice()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>

              <button
                onClick={() => handleStartReviewSession()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Start 20-min Focus</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
