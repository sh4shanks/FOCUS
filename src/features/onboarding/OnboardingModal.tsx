import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { Sparkles, ArrowRight, Check, X, BookOpen, Clock, Target, Calendar } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { onboardingOpen, completeOnboarding, userProfile } = useFocusStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(userProfile.name || '');
  const [grade, setGrade] = useState(userProfile.grade || '12th Grade / Senior');
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(3.5);
  const [preferredTimes, setPreferredTimes] = useState<string[]>(['Evening (6 PM - 9 PM)']);
  const [priorities, setPriorities] = useState(userProfile.academicPriorities || '');
  const [isFinishing, setIsFinishing] = useState(false);

  if (!onboardingOpen) return null;

  const timeOptions = [
    'Early Morning (6 AM - 8 AM)',
    'Late Morning (9 AM - 12 PM)',
    'Afternoon (2 PM - 5 PM)',
    'Evening (6 PM - 9 PM)',
    'Late Night (9 PM - 12 AM)',
  ];

  const toggleTimeOption = (t: string) => {
    setPreferredTimes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setIsFinishing(true);
      setTimeout(() => {
        completeOnboarding({
          name: name.trim() || 'Student',
          grade,
          dailyGoalHours,
          preferredStudyTimes: preferredTimes,
          academicPriorities: priorities.trim() || 'Improve core subject grades and master syllabus',
        });
      }, 1200);
    }
  };

  const handleSkip = () => {
    setIsFinishing(true);
    setTimeout(() => {
      completeOnboarding({
        name: name.trim() || 'Student',
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f111a] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Progress Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
              Personalizing Your Academic OS • {step}/3
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {!isFinishing ? (
            <>
              {step === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                      Welcome to FOCUS
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">What should we call you?</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Let's set up your private academic profile.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Chen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:border-cyan-500 focus:outline-none placeholder:text-slate-600"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Current Grade / Academic Level
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/[0.08] text-white text-sm focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="9th Grade / Freshman">9th Grade / Freshman</option>
                        <option value="10th Grade / Sophomore">10th Grade / Sophomore</option>
                        <option value="11th Grade / Junior">11th Grade / Junior</option>
                        <option value="12th Grade / Senior">12th Grade / Senior</option>
                        <option value="Undergraduate University">Undergraduate University</option>
                        <option value="Competitive Exam Aspirant">Competitive Exam Aspirant</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                      Study Capacity
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">How much time do you have?</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      We prevent impossible schedules by never overloading your daily limit.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2">
                        <span className="text-slate-300">Target Daily Study Hours</span>
                        <span className="font-mono text-cyan-400 font-bold">{dailyGoalHours} hours/day</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="0.5"
                        value={dailyGoalHours}
                        onChange={(e) => setDailyGoalHours(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>1 hr</span>
                        <span>3.5 hrs (Recommended)</span>
                        <span>8 hrs</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Preferred Study Slots
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {timeOptions.map((opt) => {
                          const isSel = preferredTimes.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleTimeOption(opt)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                                isSel
                                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06]'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSel && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                      Academic Focus
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">What's your primary goal?</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      FOCUS organizes your tasks, revisions, and Quick Focus around this.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Current Priority or Target Exam
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Master Calculus integration and raise Physics exam score past 90%"
                      value={priorities}
                      onChange={(e) => setPriorities(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-300/90 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      Demo subjects (Physics, Maths, Chemistry, CS, Literature) and syllabus chapters have been preloaded to help you explore immediately.
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-6">
                {step > 1 ? (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <span>{step === 3 ? 'Finish & Launch' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Ready to focus transition screen as requested in prompt:
               "At the end show: You're ready to focus. Then transition into the dashboard."
            */
            <div className="py-10 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                You're ready to focus.
              </h2>
              <p className="text-slate-400 text-sm">
                Preparing your personal study dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
