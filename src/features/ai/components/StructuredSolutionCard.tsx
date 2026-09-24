import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  BookmarkPlus,
  StickyNote,
  Zap,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StructuredSolution } from '../../../types/ai';
import { useFocusStore } from '../../../store/useFocusStore';

interface StructuredSolutionCardProps {
  solution: StructuredSolution;
  onExplainSimpler?: () => void;
  onSimilarQuestion?: () => void;
  onTestMe?: () => void;
}

export const StructuredSolutionCard: React.FC<StructuredSolutionCardProps> = ({
  solution,
  onExplainSimpler,
  onSimilarQuestion,
  onTestMe,
}) => {
  const { addAIRevisionItem, addAINote, openQuickFocus, setCurrentView } = useFocusStore();
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });
  const [savedToRevision, setSavedToRevision] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  const toggleStep = (idx: number) => {
    setExpandedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddToRevision = () => {
    addAIRevisionItem(solution.topic || solution.detectedQuestion.slice(0, 30), solution.subject || 'STEM');
    setSavedToRevision(true);
    setTimeout(() => setSavedToRevision(false), 3000);
  };

  const handleAddToNotes = () => {
    const content = `### Question\n${solution.detectedQuestion}\n\n### Understanding\n${solution.understanding}\n\n### Final Answer\n${solution.finalAnswer}\n\n### Pitfalls to Avoid\n${(solution.commonPitfalls || []).join('\n* ')}`;
    addAINote(
      `${solution.topic || 'Problem Solution'}: ${solution.detectedQuestion.slice(0, 30)}`,
      solution.subject || 'Study Notes',
      content,
      solution.formulas
    );
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 3000);
  };

  const handleStartQuickFocus = () => {
    openQuickFocus(30, solution.topic || 'Step-by-Step Problem Solving', solution.subject);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl overflow-hidden shadow-2xl transition-all">
      {/* Header with subject & topic tags */}
      <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/30">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wide">
              {solution.subject || 'Question Solved'}
            </span>
            {solution.topic && (
              <span className="px-2.5 py-0.5 rounded-full text-xs text-slate-300 bg-white/5 border border-white/10">
                {solution.topic}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> First-Principles Verified
          </span>
        </div>

        {/* Extracted question text */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-cyan-400/80 mb-1 uppercase tracking-wider">
            Detected Question
          </div>
          <p className="text-slate-100 text-sm font-medium leading-relaxed select-text">
            {solution.detectedQuestion}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Core Understanding */}
        {solution.understanding && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <Lightbulb className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300 block mb-1">Conceptual Anchor</span>
              {solution.understanding}
            </div>
          </div>
        )}

        {/* Given values and governing formulas in 2-col responsive grid */}
        {((solution.given && solution.given.length > 0) || (solution.formulas && solution.formulas.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {solution.given && solution.given.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Given & Identified Constants
                </div>
                <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                  {solution.given.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {solution.formulas && solution.formulas.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Governing Formulas & Laws
                </div>
                <ul className="space-y-1.5 text-xs font-mono text-blue-200">
                  {solution.formulas.map((formula, i) => (
                    <li key={i} className="flex items-start gap-2 bg-blue-950/30 p-1.5 rounded border border-blue-500/20">
                      <span className="text-blue-400 font-bold">ƒ:</span>
                      <span>{formula}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Derivation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Step-by-Step Solution Breakdown
            </h4>
            <span className="text-[11px] text-slate-400">
              {solution.steps.length} {solution.steps.length === 1 ? 'step' : 'sequential steps'}
            </span>
          </div>

          <div className="space-y-3">
            {solution.steps.map((step, idx) => {
              const isExpanded = expandedSteps[idx] ?? true;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden transition-all hover:border-white/15"
                >
                  <button
                    onClick={() => toggleStep(idx)}
                    className="w-full flex items-center justify-between p-3.5 text-left bg-white/[0.01] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold font-mono">
                        {step.stepNumber || idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {step.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-white/5 space-y-2.5">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {step.explanation}
                      </p>
                      {step.mathExpression && (
                        <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/20 font-mono text-xs text-cyan-200 overflow-x-auto">
                          {step.mathExpression}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Answer Banner */}
        <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Final Answer
          </div>
          <div className="text-slate-100 text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-line font-mono">
            {solution.finalAnswer}
          </div>
        </div>

        {/* Common Pitfalls / Exam Traps */}
        {solution.commonPitfalls && solution.commonPitfalls.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/25">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Common Exam Traps & Sign Mistakes
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {solution.commonPitfalls.map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative method if present */}
        {solution.alternativeMethod && (
          <div className="p-3.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 text-xs text-slate-300">
            <span className="font-semibold text-blue-300 block mb-1">Alternative Verification Method:</span>
            {solution.alternativeMethod}
          </div>
        )}

        {/* Integrated Action Buttons */}
        <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-2 sm:gap-3">
          {onExplainSimpler && (
            <button
              onClick={onExplainSimpler}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
              Explain Simpler
            </button>
          )}

          {onSimilarQuestion && (
            <button
              onClick={onSimilarQuestion}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              Similar Practice Question
            </button>
          )}

          {onTestMe && (
            <button
              onClick={onTestMe}
              className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-300" />
              Test Me
            </button>
          )}

          <button
            onClick={handleAddToRevision}
            disabled={savedToRevision}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              savedToRevision
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
            {savedToRevision ? 'Added to Spaced Repetition' : 'Add to Revision'}
          </button>

          <button
            onClick={handleAddToNotes}
            disabled={savedToNotes}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              savedToNotes
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-400" />
            {savedToNotes ? 'Saved in Notes' : 'Add to Notes'}
          </button>

          <button
            onClick={handleStartQuickFocus}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all ml-auto"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            Start 30-min Quick Focus
          </button>
        </div>
      </div>
    </div>
  );
};
