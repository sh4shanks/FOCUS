import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Camera,
  Plus,
  Trash2,
  BookmarkPlus,
  StickyNote,
  Zap,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Target,
  Play,
  BrainCircuit,
  X,
  Layers,
} from 'lucide-react';
import { useFocusStore } from '../../store/useFocusStore';
import { ChatMessage, PracticeSet } from '../../types/ai';
import { aiProvider } from './services/aiProvider';
import { buildAIContext } from './services/aiContextService';

export const FocusAIView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    createConversation,
    addMessageToConversation,
    setActiveConversationId,
    deleteConversation,
    renameConversation,
    addAIRevisionItem,
    addAINote,
    openQuickFocus,
    openPracticeMode,
    scheduleRevisionFromPractice,
    setCurrentView,
    subjects,
    userProfile,
  } = useFocusStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [quickGenOpen, setQuickGenOpen] = useState(false);
  const [quickGenTopic, setQuickGenTopic] = useState('Ray Optics');
  const [quickGenSubject, setQuickGenSubject] = useState('All');
  const [quickGenDifficulty, setQuickGenDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quickGenCount, setQuickGenCount] = useState<number>(5);
  const [revisionAddedMap, setRevisionAddedMap] = useState<Record<string, boolean>>({});
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string }>({
    configured: true,
    model: 'gemini-3.8-flash',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend AI status on mount
  useEffect(() => {
    aiProvider.getStatus().then(setAiStatus);
  }, []);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isGenerating]);

  const handleGeneratePracticeInChat = async (options?: {
    topic?: string;
    subject?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    count?: number;
  }) => {
    const rawTopic = options?.topic?.trim() || quickGenTopic.trim() || 'Key Concepts';
    const subj =
      options?.subject && options.subject !== 'All'
        ? options.subject
        : selectedSubject !== 'All'
        ? selectedSubject
        : subjects[0]?.name || 'Physics';
    const diff = options?.difficulty || quickGenDifficulty || 'Medium';
    const count = options?.count || quickGenCount || 5;

    let convId = activeConversationId;
    if (!convId || !activeConv) {
      convId = createConversation(`Practice: ${rawTopic}`);
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `Generate an adaptive practice set on "${rawTopic}" (${subj}, ${diff} difficulty) with immediate feedback and active recall rationale.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessageToConversation(convId, userMsg);
    setIsGenerating(true);
    setQuickGenOpen(false);

    try {
      const generatedSet = await aiProvider.generatePractice({
        subject: subj,
        topic: rawTopic,
        difficulty: diff,
        count,
      });

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: `I've prepared an adaptive ${generatedSet.questions.length}-question practice set on **${generatedSet.topic}** (${generatedSet.subject}, ${generatedSet.difficulty} level).\n\nEach question includes step-by-step reasoning, active recall memory cues, and common exam traps. You can start interactive practice immediately or add these concepts directly to your spaced repetition schedule.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        practiceSet: generatedSet,
        suggestedActions: [
          {
            type: 'launch-practice',
            label: '🚀 Start Interactive Practice',
            payload: { practiceSet: generatedSet },
          },
          {
            type: 'add-revision',
            label: '📅 Add to Revision',
            payload: { topic: generatedSet.topic, subject: generatedSet.subject },
          },
          {
            type: 'quick-focus',
            label: '⚡ 20m Focus Session',
            payload: { topic: generatedSet.topic, subject: generatedSet.subject, duration: 20 },
          },
        ],
      };

      addMessageToConversation(convId, aiMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (textToSend?: string, mode?: 'normal' | 'explain-simpler' | 'give-example' | 'practice' | 'test-me') => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isGenerating) return;

    // Check if user is asking to generate a practice set / quiz directly in chat
    const lower = text.toLowerCase();
    const isPracticeIntent =
      lower.startsWith('practice') ||
      lower.startsWith('quiz me') ||
      lower.startsWith('test me') ||
      lower.includes('generate a practice set') ||
      lower.includes('generate practice') ||
      lower.includes('create a practice set') ||
      lower.includes('create a quiz') ||
      lower.includes('practice questions on');

    if (isPracticeIntent && !textToSend) {
      setInputPrompt('');
      let extractedTopic = text
        .replace(/^(generate\s+(a\s+)?practice\s+set(\s+on|\s+for)?|create\s+(a\s+)?quiz(\s+on|\s+for)?|quiz\s+me\s+on|test\s+me\s+on|practice\s+questions\s+on|practice\s+on|practice)/i, '')
        .trim();
      if (!extractedTopic || extractedTopic.length < 2) {
        extractedTopic = quickGenTopic || 'Key Concepts';
      }
      return handleGeneratePracticeInChat({
        topic: extractedTopic,
        subject: selectedSubject !== 'All' ? selectedSubject : undefined,
      });
    }

    let convId = activeConversationId;
    if (!convId || !activeConv) {
      convId = createConversation('Study Session');
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessageToConversation(convId, userMsg);
    if (!textToSend) setInputPrompt('');
    setIsGenerating(true);

    try {
      const currentMessages = activeConv ? [...activeConv.messages, userMsg] : [userMsg];
      const context = buildAIContext({
        includeSyllabus: true,
        includeExams: true,
        includeTasks: true,
        includeRevision: true,
        currentSubject: selectedSubject !== 'All' ? selectedSubject : undefined,
      });

      const response = await aiProvider.chat({
        messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
        context,
        mode: mode || 'normal',
        subject: selectedSubject !== 'All' ? selectedSubject : undefined,
      });

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions as any,
        isDemo: response.isDemo,
      };

      addMessageToConversation(convId, aiMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleActionClick = (action: any, parentMsg: ChatMessage) => {
    if (action.type === 'explain-simpler') {
      handleSendMessage('Could you explain that in simpler terms with an intuitive analogy?', 'explain-simpler');
    } else if (action.type === 'give-example') {
      handleSendMessage('Can you give a concrete, high-yield exam example of this?', 'give-example');
    } else if (action.type === 'launch-practice') {
      const pSet = action.payload?.practiceSet;
      if (pSet) {
        openPracticeMode({
          practiceSet: pSet,
          autoStart: true,
          topic: pSet.topic,
          subject: pSet.subject,
        });
      } else {
        openPracticeMode({
          topic: action.payload?.topic || selectedSubject || 'Key Concepts',
          subject: action.payload?.subject || selectedSubject,
          autoStart: true,
        });
      }
    } else if (action.type === 'test-me' || action.type === 'practice-set') {
      const topic = action.payload?.topic || quickGenTopic || 'Key Concepts';
      const subj = action.payload?.subject || selectedSubject;
      handleGeneratePracticeInChat({ topic, subject: subj });
    } else if (action.type === 'add-revision') {
      const topic = action.payload?.topic || parentMsg.practiceSet?.topic || 'Core Concept';
      const subj = action.payload?.subject || parentMsg.practiceSet?.subject || selectedSubject;
      const weakConcepts = parentMsg.practiceSet?.questions
        ? (parentMsg.practiceSet.questions.map((q) => q.conceptTag).filter(Boolean) as string[])
        : [];
      scheduleRevisionFromPractice({
        topic,
        subject: subj,
        score: 0,
        total: 5,
        percentage: 50,
        weakConcepts,
      });
      setRevisionAddedMap((prev) => ({ ...prev, [parentMsg.id]: true }));
    } else if (action.type === 'add-notes') {
      const title = action.payload?.title || 'FOCUS AI Concept';
      const subj = action.payload?.subject || selectedSubject;
      addAINote(title, subj, parentMsg.content, action.payload?.formulaSnippets);
    } else if (action.type === 'quick-focus') {
      const dur = action.payload?.duration || 30;
      const top = action.payload?.topic || 'Concept Mastery';
      const sub = action.payload?.subject || selectedSubject;
      openQuickFocus(dur, top, sub);
    }
  };

  const quickStarterCards = [
    {
      title: 'Explain a Topic',
      desc: 'Understand difficult concepts with intuitive analogies and first principles.',
      prompt: 'Can you explain the photoelectric effect and how work function determines cutoff frequency?',
      icon: Lightbulb,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Solve a Problem',
      desc: 'Work through complex numerical or derivation problems step by step.',
      prompt: 'A convex lens of focal length 20 cm touches a concave lens of focal length 30 cm. Find the combination power and focal length.',
      icon: BookOpen,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Snap & Solve',
      desc: 'Upload or snap a photo of any handwritten or textbook question.',
      onClick: () => setCurrentView('snap-solve'),
      icon: Camera,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Practice Mode',
      desc: 'Generate targeted adaptive recall questions with active explanations.',
      onClick: () => {
        setQuickGenTopic(selectedSubject !== 'All' ? `${selectedSubject} Concepts` : 'Ray Optics');
        setQuickGenOpen(true);
      },
      icon: Target,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'What should I study?',
      desc: 'Intelligently allocate your available time based on deadlines and syllabus gaps.',
      prompt: 'I have 30 minutes right now. Based on my upcoming exams and syllabus progress, what should I study?',
      icon: Zap,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Simplify / ELI12',
      desc: 'Break down an intimidating theorem or formula as if I am 12 years old.',
      prompt: 'Explain the Arrhenius equation and activation energy like I am 12 years old.',
      icon: Sparkles,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Quick Practice Generator Modal Dialog */}
      {quickGenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d0f18] border border-white/10 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Generate Practice Set
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Creates adaptive active recall questions with step-by-step reasoning.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickGenOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Target Topic / Concept
                </label>
                <input
                  type="text"
                  value={quickGenTopic}
                  onChange={(e) => setQuickGenTopic(e.target.value)}
                  placeholder="e.g., Snell's Law, Photoelectric Effect, Gauss Theorem..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Subject Context
                  </label>
                  <select
                    value={quickGenSubject}
                    onChange={(e) => setQuickGenSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="All" className="bg-slate-900 text-slate-200">
                      Auto-detect / All
                    </option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name} className="bg-slate-900 text-slate-200">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setQuickGenDifficulty(diff)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          quickGenDifficulty === diff
                            ? diff === 'Easy'
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : diff === 'Hard'
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                              : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuickGenCount(count)}
                      className={`py-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-0.5 transition-all ${
                        quickGenCount === count
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-sm">{count} Qs</span>
                      <span className="text-[10px] text-slate-400">
                        {count === 5 ? 'Quick (6m)' : count === 10 ? 'Standard (12m)' : 'Deep Dive (20m)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setQuickGenOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleGeneratePracticeInChat({
                      topic: quickGenTopic,
                      subject: quickGenSubject,
                      difficulty: quickGenDifficulty,
                      count: quickGenCount,
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Generate in Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickGenOpen(false);
                    openPracticeMode({
                      topic: quickGenTopic,
                      subject: quickGenSubject !== 'All' ? quickGenSubject : undefined,
                      difficulty: quickGenDifficulty,
                      count: quickGenCount,
                      autoStart: true,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Launch Practice Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations Drawer / Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-64 lg:w-72 border-r border-white/[0.06] bg-[#090a10]/95 backdrop-blur-xl shrink-0 p-3.5 select-none z-20`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Study Threads
            </span>
          </div>
          <button
            onClick={() => createConversation('New Study Topic')}
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1 text-xs"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* List of Conversations */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {conversations.map((c) => {
            const isActive = c.id === activeConv?.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConversationId(c.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate font-medium">{c.title}</span>
                </div>

                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Snap & Solve Shortcut Banner */}
        <div
          onClick={() => setCurrentView('snap-solve')}
          className="mt-3 p-3 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 cursor-pointer hover:border-cyan-500/60 transition-all group"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Snap & Solve</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Take a photo of a textbook or handwritten question to extract and solve it instantly.
          </p>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#08090e] overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-14 border-b border-white/[0.06] bg-[#090a10]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[180px] sm:max-w-md">
                {activeConv?.title || 'FOCUS AI Copilot'}
              </h2>
            </div>

            {/* Model / Engine badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <Sparkles className="w-2.5 h-2.5" /> {aiStatus.configured ? 'gemini-3.8-flash' : 'Academic Engine'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Subject Selector Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs bg-white/[0.05] border border-white/10 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="All" className="bg-slate-900 text-slate-200">
                All Subjects Context
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name} className="bg-slate-900 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>

            {/* Practice Set Quick Generator Button */}
            <button
              onClick={() => {
                setQuickGenTopic(selectedSubject !== 'All' ? `${selectedSubject} Concepts` : 'Ray Optics');
                setQuickGenOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Practice Set</span>
            </button>

            {/* Snap & Solve Direct Button */}
            <button
              onClick={() => setCurrentView('snap-solve')}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Snap & Solve</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {(!activeConv || activeConv.messages.length === 0) && (
            <div className="max-w-3xl mx-auto pt-4 pb-10 space-y-8 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  FOCUS AI — Your Study Copilot
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                  Ask questions, understand difficult concepts, solve problems step by step, or turn confusion into an actionable study plan.
                </p>
              </div>

              {/* 6 High-Yield Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickStarterCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (card.onClick) {
                          card.onClick();
                        } else if (card.prompt) {
                          handleSendMessage(card.prompt);
                        }
                      }}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/40 cursor-pointer transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`p-2 rounded-lg border ${card.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeConv?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] sm:max-w-[85%]`}>
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium ml-auto'
                        : 'bg-slate-900/90 border border-white/[0.08] text-slate-200'
                    }`}
                  >
                    {/* Message content formatted with markdown rendering */}
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line leading-relaxed space-y-2">
                      {msg.content}
                    </div>

                    {/* Embedded In-Chat Practice Set Card */}
                    {msg.practiceSet && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                <Target className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                                  Generated Practice Set
                                </span>
                                <h4 className="text-xs font-bold text-white">
                                  {msg.practiceSet.topic}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                                {msg.practiceSet.subject}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full border font-semibold ${
                                  msg.practiceSet.difficulty === 'Easy'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : msg.practiceSet.difficulty === 'Hard'
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                }`}
                              >
                                {msg.practiceSet.difficulty || 'Medium'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                                {msg.practiceSet.questions.length} Qs
                              </span>
                            </div>
                          </div>

                          {/* Preview first question */}
                          {msg.practiceSet.questions[0] && (
                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1.5 text-xs">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                Sample Preview • Question 1 of {msg.practiceSet.questions.length}
                              </span>
                              <p className="text-slate-200 font-medium text-[11px] leading-relaxed">
                                {msg.practiceSet.questions[0].question}
                              </p>
                              {msg.practiceSet.questions[0].options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                                  {msg.practiceSet.questions[0].options.slice(0, 4).map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className="px-2 py-1 rounded bg-black/30 text-[10px] text-slate-300 truncate border border-white/[0.03]"
                                    >
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick Interactive Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              onClick={() =>
                                openPracticeMode({
                                  practiceSet: msg.practiceSet,
                                  autoStart: true,
                                  topic: msg.practiceSet?.topic,
                                  subject: msg.practiceSet?.subject,
                                })
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
                            >
                              <Play className="w-3.5 h-3.5 fill-slate-950" />
                              <span>Start Interactive Practice</span>
                            </button>

                            <button
                              onClick={() => {
                                const weakConcepts = msg.practiceSet?.questions
                                  ? (msg.practiceSet.questions.map((q) => q.conceptTag).filter(Boolean) as string[])
                                  : [];
                                scheduleRevisionFromPractice({
                                  topic: msg.practiceSet?.topic || 'Core Concept',
                                  subject: msg.practiceSet?.subject || 'General',
                                  score: 0,
                                  total: msg.practiceSet?.questions.length || 5,
                                  percentage: 50,
                                  weakConcepts,
                                });
                                setRevisionAddedMap((prev) => ({ ...prev, [msg.id]: true }));
                              }}
                              disabled={revisionAddedMap[msg.id]}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                revisionAddedMap[msg.id]
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white'
                              }`}
                            >
                              <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                              <span>
                                {revisionAddedMap[msg.id]
                                  ? 'Added to Spaced Repetition ✓'
                                  : 'Add to Revision'}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                openQuickFocus(20, msg.practiceSet?.topic || 'Practice Session', msg.practiceSet?.subject || 'General');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1 transition-all"
                            >
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>Focus 20m</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isUser && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
                        <span className="font-mono">{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-cyan-300 transition-colors flex items-center gap-1"
                            title="Copy response"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Context-Aware Action Buttons for Assistant Responses */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-1">
                      {msg.suggestedActions.map((action, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleActionClick(action, msg)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-slate-300 hover:text-cyan-200 text-[11px] font-medium flex items-center gap-1.5 transition-all"
                        >
                          {action.type === 'explain-simpler' && <Lightbulb className="w-3 h-3 text-cyan-400" />}
                          {action.type === 'give-example' && <RotateCcw className="w-3 h-3 text-blue-400" />}
                          {action.type === 'test-me' && <HelpCircle className="w-3 h-3 text-purple-400" />}
                          {action.type === 'add-revision' && <BookmarkPlus className="w-3 h-3 text-emerald-400" />}
                          {action.type === 'add-notes' && <StickyNote className="w-3 h-3 text-amber-400" />}
                          {action.type === 'quick-focus' && <Zap className="w-3 h-3 text-cyan-400" />}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 max-w-3xl mr-auto justify-start">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/[0.08] text-slate-300 text-xs flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">
                  Reasoning through concepts...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-[#090a10]/95 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => handleSendMessage('What should I study right now with 30 minutes?')}
                className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-cyan-400" /> What should I study?
              </button>
              <button
                onClick={() => handleSendMessage('Could you explain this simpler with an intuitive analogy?')}
                className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" /> Explain Simpler
              </button>
              <button
                onClick={() => {
                  setQuickGenTopic(selectedSubject !== 'All' ? `${selectedSubject} Concepts` : 'Ray Optics');
                  setQuickGenOpen(true);
                }}
                className="px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Target className="w-3 h-3 text-purple-400" /> Practice Set
              </button>
              <button
                onClick={() => setCurrentView('snap-solve')}
                className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> Snap a Question Photo
              </button>
            </div>

            {/* Input Form */}
            <div className="relative flex items-center rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-cyan-500/60 transition-all p-1.5 shadow-inner">
              <button
                onClick={() => setCurrentView('snap-solve')}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                title="Snap & Solve with Camera"
              >
                <Camera className="w-5 h-5" />
              </button>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask FOCUS AI anything about your syllabus, homework, or exam prep..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-28"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isGenerating}
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 text-slate-950 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
