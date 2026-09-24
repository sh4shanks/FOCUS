import React, { useState, useEffect, useRef } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import {
  FileText,
  Plus,
  Zap,
  Bookmark,
  Sparkles,
  Trash2,
  Search,
  X,
  Tag,
  Share2,
  Download,
  Copy,
  Check,
  FileCode,
  Edit3,
  Star,
  Clock,
  Cloud,
  CheckCircle2,
  Mic,
  MicOff,
  Radio,
  Volume2,
  Pin,
  PinOff,
  ArrowUpDown,
  Folder,
  FolderPlus,
  FolderOpen,
  FolderInput,
  Layers,
} from 'lucide-react';
import {
  QuickNote,
  exportSingleNoteToMarkdown,
  exportSingleNoteToPlainText,
  downloadFile,
} from './exportUtils';
import { ExportNotesModal } from './ExportNotesModal';
import { useSpeechRecognition } from './useSpeechRecognition';
import { DictationControlBar, DictationTarget } from './DictationControlBar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownEditorToolbar, applyMarkdownFormat } from './MarkdownEditorToolbar';
import {
  NotebookFolder,
  DEFAULT_NOTEBOOK_FOLDERS,
  NOTEBOOK_COLOR_CONFIG,
  renderNotebookIcon,
  loadNotebookFolders,
  saveNotebookFolders,
} from './notebookTypes';
import { NotebookFolderBar } from './NotebookFolderBar';

const defaultNotes: QuickNote[] = [
  {
    id: 'note-1',
    title: 'Snell’s Law & Lens Maker Equation',
    subject: 'Physics',
    category: 'Formula',
    content:
      '**Refraction at spherical surfaces:** `n₂/v - n₁/u = (n₂ - n₁)/R`\n\n- Lens maker formula relates curvature radii with focal length in refractive medium.\n- Always apply **Cartesian sign conventions** measured from the optical pole.\n- Submerging lens in water increases focal length by $\\approx 4\\times$ due to reduced relative refractive index.',
    formulaSnippets: ['n₁ · sin(θ₁) = n₂ · sin(θ₂)', '1/f = (n - 1) · (1/R₁ - 1/R₂)'],
    tags: ['Optics', 'Exam High-Yield'],
    updatedAt: '2 days ago',
    isPinned: true,
    notebookId: 'notebook-formulas',
  },
  {
    id: 'note-2',
    title: 'Calculus: Integration by Parts & Trigonometric Substitutions',
    subject: 'Mathematics',
    category: 'Formula',
    content:
      '**LIATE Priority Hierarchy** for selecting function $u$ in integration by parts:\n\n1. **L** - Logarithmic functions (e.g. `ln x`)\n2. **I** - Inverse trigonometric (e.g. `arctan x`)\n3. **A** - Algebraic polynomials (e.g. `x²`, `3x`)\n4. **T** - Trigonometric (e.g. `sin x`, `cos x`)\n5. **E** - Exponential functions (e.g. `eˣ`)\n\n*Rule:* Choose the function appearing earlier in **LIATE** as $u$.',
    formulaSnippets: ['∫ u · dv = u·v - ∫ v · du', 'sin²(x) + cos²(x) = 1'],
    tags: ['Calculus', 'Core'],
    updatedAt: 'Yesterday',
    notebookId: 'notebook-formulas',
  },
  {
    id: 'note-3',
    title: 'Macbeth Act 3 Theme of Tyranny & Paranoia',
    subject: 'Literature',
    category: 'Summary',
    content:
      '> *"To be thus is nothing, but to be safely thus."*\n\n- **Psychological Cage**: Macbeth realizes that usurped power provides no inner serenity; suspicion consumes him.\n- **Motif of Sleeplessness**: Guilt destroys natural restoration and order.\n- *Contrast:* Lady Macbeth counsels composure (*"What\'s done is done"*), but Macbeth descends further into reckless tyrannical cruelty.',
    formulaSnippets: [],
    tags: ['Macbeth', 'Quotes'],
    updatedAt: '3 days ago',
    notebookId: 'notebook-quotes',
  },
  {
    id: 'note-4',
    title: 'Arrhenius Equation & Activation Energy',
    subject: 'Chemistry',
    category: 'Formula',
    content:
      '**Temperature dependence of reaction rates:**\n\n- The slope of `ln(k)` versus `1/T` yields `-Ea/R` directly from kinetics experiments.\n- *High Activation Energy ($E_a$):* Rate is **extremely sensitive** to temperature variations.\n- *Pre-exponential factor $A$:* Reflects collision frequency and steric orientation.',
    formulaSnippets: ['k = A · e^(-Ea / (R·T))', 'ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂)'],
    tags: ['Kinetics', 'Physical Chem'],
    updatedAt: '4 days ago',
    notebookId: 'notebook-revision',
  },
];

export const NotesView: React.FC = () => {
  const {
    subjects,
    openQuickFocus,
    notes: storeNotes,
    addNote,
    updateNote,
    deleteNote,
    toggleFavoriteNote,
    togglePinNote,
  } = useFocusStore();

  const [notes, setNotes] = useState<QuickNote[]>(() => {
    if (storeNotes && storeNotes.length > 0) {
      return storeNotes;
    }
    const saved = localStorage.getItem('focus_notes_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultNotes;
      }
    }
    return defaultNotes;
  });

  // Auto-saved status tracking
  type AutoSaveStatus = 'saved' | 'saving';
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingNoteUpdatesRef = useRef<QuickNote | null>(null);
  const isEditingRef = useRef<boolean>(false);

  // Sync external store additions (e.g. from AI Copilot) if not currently typing
  useEffect(() => {
    if (!isEditingRef.current && storeNotes && storeNotes.length > 0) {
      setNotes(storeNotes);
    }
  }, [storeNotes]);

  // Clean up debounce timer and flush on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (pendingNoteUpdatesRef.current) {
        updateNote(pendingNoteUpdatesRef.current as any);
      }
    };
  }, [updateNote]);

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyPinned, setOnlyPinned] = useState(false);
  type NoteSortOption = 'recent' | 'title-asc' | 'title-desc' | 'subject' | 'category';
  const [sortBy, setSortBy] = useState<NoteSortOption>('recent');
  
  // Notebook Folder Collections State
  const [folders, setFolders] = useState<NotebookFolder[]>(() => loadNotebookFolders());
  const [activeFolderId, setActiveFolderId] = useState<string>('all');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [selectedNoteForExport, setSelectedNoteForExport] = useState<QuickNote | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey '/' or 'Cmd+K' / 'Ctrl+K' to quickly focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Folder management handlers
  const handleCreateFolder = (folderData: Omit<NotebookFolder, 'id' | 'createdAt'>) => {
    const newFolder: NotebookFolder = {
      ...folderData,
      id: `notebook-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    saveNotebookFolders(updated);
    setActiveFolderId(newFolder.id);
    showToast(`Created notebook "${newFolder.name}" ✨`);
  };

  const handleUpdateFolder = (id: string, updates: Partial<NotebookFolder>) => {
    const updated = folders.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFolders(updated);
    saveNotebookFolders(updated);
    showToast('Notebook collection updated');
  };

  const handleDeleteFolder = (id: string) => {
    const folderToDelete = folders.find((f) => f.id === id);
    const updatedFolders = folders.filter((f) => f.id !== id);
    setFolders(updatedFolders);
    saveNotebookFolders(updatedFolders);

    // Reassign notes in this folder to 'notebook-general'
    const updatedNotes = notes.map((n) =>
      (n.notebookId === id ? { ...n, notebookId: 'notebook-general' } : n)
    );
    setNotes(updatedNotes);
    localStorage.setItem('focus_notes_data', JSON.stringify(updatedNotes));

    if (activeFolderId === id) {
      setActiveFolderId('all');
    }
    showToast(`Deleted collection "${folderToDelete?.name}". Notes moved to General.`);
  };

  const handleMoveNoteToFolder = (noteId: string, targetFolderId: string) => {
    handleUpdateNote(noteId, { notebookId: targetFolderId });
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    showToast(`Moved note to "${targetFolder?.name || 'Collection'}" 📁`);
  };

  // New note form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Physics');
  const [newCategory, setNewCategory] = useState<'Formula' | 'Concept' | 'Summary' | 'Quote'>('Formula');
  const [newContent, setNewContent] = useState('');
  const [newFormulas, setNewFormulas] = useState('');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newNotebookId, setNewNotebookId] = useState<string>('notebook-formulas');

  // Markdown Editor States & Refs
  const createContentRef = useRef<HTMLTextAreaElement>(null);
  const editContentRef = useRef<HTMLTextAreaElement>(null);
  const [createTab, setCreateTab] = useState<'write' | 'preview'>('write');
  const [editTab, setEditTab] = useState<'write' | 'preview'>('write');

  // Speech Recognition / Voice Dictation state
  const [dictationTarget, setDictationTarget] = useState<DictationTarget>('content');
  const [dictationContext, setDictationContext] = useState<'create' | 'edit' | null>(null);

  const dictationTargetRef = useRef<DictationTarget>('content');
  const dictationContextRef = useRef<'create' | 'edit' | null>(null);
  const editingNoteRef = useRef<QuickNote | null>(null);

  useEffect(() => {
    dictationTargetRef.current = dictationTarget;
  }, [dictationTarget]);

  useEffect(() => {
    dictationContextRef.current = dictationContext;
  }, [dictationContext]);

  useEffect(() => {
    editingNoteRef.current = editingNote;
  }, [editingNote]);

  // Immediate debounced update handler for typing changes
  const handleUpdateNote = (id: string, updates: Partial<QuickNote>) => {
    isEditingRef.current = true;
    setAutoSaveStatus('saving');

    const nowTime = getFormattedTime();
    let updatedTarget: QuickNote | null = null;

    const updatedNotes = notes.map((n) => {
      if (n.id === id) {
        updatedTarget = {
          ...n,
          ...updates,
          updatedAt: 'Just now',
        };
        return updatedTarget;
      }
      return n;
    });

    setNotes(updatedNotes);
    if (editingNote && editingNote.id === id && updatedTarget) {
      setEditingNote(updatedTarget);
    }
    pendingNoteUpdatesRef.current = updatedTarget;

    // Reset debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingNoteUpdatesRef.current) {
        const noteToSave = pendingNoteUpdatesRef.current;
        // Persist to zustand store (persisted to localStorage in useFocusStore)
        updateNote(noteToSave as any);
        // Persist to quick notes cache
        localStorage.setItem('focus_notes_data', JSON.stringify(updatedNotes));
        pendingNoteUpdatesRef.current = null;
      }
      setAutoSaveStatus('saved');
      setLastSavedTime(nowTime);
      isEditingRef.current = false;
    }, 600);
  };

  const handleSpeechChunk = (finalChunk: string) => {
    if (!finalChunk || !finalChunk.trim()) return;
    const target = dictationTargetRef.current;
    const ctx = dictationContextRef.current;

    if (ctx === 'create') {
      if (target === 'content') {
        setNewContent((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
      } else if (target === 'title') {
        setNewTitle((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
      } else if (target === 'formulas') {
        setNewFormulas((prev) => (prev ? `${prev}\n${finalChunk.trim()}` : finalChunk.trim()));
      }
    } else if (ctx === 'edit' && editingNoteRef.current) {
      const note = editingNoteRef.current;
      if (target === 'content') {
        const updated = note.content ? `${note.content} ${finalChunk.trim()}` : finalChunk.trim();
        handleUpdateNote(note.id, { content: updated });
      } else if (target === 'title') {
        const updated = note.title ? `${note.title} ${finalChunk.trim()}` : finalChunk.trim();
        handleUpdateNote(note.id, { title: updated });
      } else if (target === 'formulas') {
        const updated = [...(note.formulaSnippets || []), finalChunk.trim()];
        handleUpdateNote(note.id, { formulaSnippets: updated });
      }
    }
  };

  const {
    isSupported: isSpeechSupported,
    isListening,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(handleSpeechChunk);

  const handleToggleDictation = (context: 'create' | 'edit', target?: DictationTarget) => {
    if (!isSpeechSupported) {
      showToast('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    const chosenTarget = target || dictationTarget;
    if (isListening && dictationContext === context && dictationTarget === chosenTarget) {
      stopListening();
      setDictationContext(null);
    } else {
      setDictationContext(context);
      setDictationTarget(chosenTarget);
      dictationContextRef.current = context;
      dictationTargetRef.current = chosenTarget;
      resetTranscript();
      startListening();
      showToast(`Listening: dictating into ${chosenTarget}...`);
    }
  };

  // Force immediate flush of pending debounce when modal closes
  const flushPendingSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (pendingNoteUpdatesRef.current) {
      const noteToSave = pendingNoteUpdatesRef.current;
      updateNote(noteToSave as any);
      localStorage.setItem('focus_notes_data', JSON.stringify(notes));
      pendingNoteUpdatesRef.current = null;
      setAutoSaveStatus('saved');
      setLastSavedTime(getFormattedTime());
    }
    isEditingRef.current = false;
  };

  const closeCreateModal = () => {
    stopListening();
    setDictationContext(null);
    setCreateTab('write');
    setCreateModalOpen(false);
  };

  const closeEditModal = () => {
    stopListening();
    setDictationContext(null);
    flushPendingSave();
    setEditTab('write');
    setEditingNote(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const snippets = newFormulas
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const created: QuickNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      category: newCategory,
      content: newContent.trim(),
      formulaSnippets: snippets,
      tags: [newSubject, newCategory],
      isFavorite: false,
      isPinned: newIsPinned,
      notebookId: newNotebookId || (activeFolderId !== 'all' ? activeFolderId : 'notebook-general'),
      updatedAt: 'Just now',
    };

    const updated = [created, ...notes];
    setNotes(updated);
    localStorage.setItem('focus_notes_data', JSON.stringify(updated));

    // Persist to store
    addNote({
      title: created.title,
      subject: created.subject,
      category: created.category as any,
      content: created.content,
      formulaSnippets: created.formulaSnippets,
      tags: created.tags,
      isFavorite: false,
      isPinned: newIsPinned,
      notebookId: created.notebookId,
    });

    const nowTime = getFormattedTime();
    setAutoSaveStatus('saved');
    setLastSavedTime(nowTime);

    setNewTitle('');
    setNewContent('');
    setNewFormulas('');
    setNewIsPinned(false);
    stopListening();
    setDictationContext(null);
    setCreateModalOpen(false);
    showToast(newIsPinned ? 'Note created & anchored to top 📌' : 'Note created & auto-saved to workspace');
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem('focus_notes_data', JSON.stringify(updated));
    setAutoSaveStatus('saved');
    setLastSavedTime(getFormattedTime());
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteNote(id);
    const updated = notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
    setNotes(updated);
    localStorage.setItem('focus_notes_data', JSON.stringify(updated));
    setAutoSaveStatus('saved');
    setLastSavedTime(getFormattedTime());
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    togglePinNote(id);
    let isNowPinned = false;
    const updated = notes.map((n) => {
      if (n.id === id) {
        isNowPinned = !n.isPinned;
        return { ...n, isPinned: isNowPinned };
      }
      return n;
    });
    setNotes(updated);
    if (editingNote && editingNote.id === id) {
      setEditingNote({ ...editingNote, isPinned: isNowPinned });
    }
    localStorage.setItem('focus_notes_data', JSON.stringify(updated));
    setAutoSaveStatus('saved');
    setLastSavedTime(getFormattedTime());
    showToast(isNowPinned ? 'Note anchored to top of list 📌' : 'Note unpinned from top');
  };

  const sortLabels: Record<NoteSortOption, string> = {
    recent: 'Recently Updated',
    'title-asc': 'Title (A → Z)',
    'title-desc': 'Title (Z → A)',
    subject: 'Subject',
    category: 'Category',
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-cyan-500/25 text-cyan-200 px-0.5 rounded font-semibold not-italic">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const filteredNotes = notes.filter((n) => {
    if (activeFolderId !== 'all') {
      const noteFolder = n.notebookId || 'notebook-general';
      if (noteFolder !== activeFolderId) {
        return false;
      }
    }
    if (onlyFavorites && !n.isFavorite) {
      return false;
    }
    if (onlyPinned && !n.isPinned) {
      return false;
    }
    if (selectedSubject !== 'all' && n.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = n.title.toLowerCase().includes(q);
      const contentMatch = n.content.toLowerCase().includes(q);
      const formulaMatch = n.formulaSnippets?.some((f) => f.toLowerCase().includes(q));
      const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(q));
      const categoryMatch = n.category?.toLowerCase().includes(q);
      return titleMatch || contentMatch || formulaMatch || tagMatch || categoryMatch;
    }
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const aPinned = Boolean(a.isPinned);
    const bPinned = Boolean(b.isPinned);

    // CRITICAL: Pinned notes are ALWAYS anchored to the top regardless of sorting!
    if (aPinned !== bPinned) {
      return aPinned ? -1 : 1;
    }

    switch (sortBy) {
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'subject': {
        const subCmp = a.subject.localeCompare(b.subject);
        return subCmp !== 0 ? subCmp : a.title.localeCompare(b.title);
      }
      case 'category': {
        const catCmp = (a.category || '').localeCompare(b.category || '');
        return catCmp !== 0 ? catCmp : a.title.localeCompare(b.title);
      }
      case 'recent':
      default:
        return 0;
    }
  });

  const pinnedTotalCount = notes.filter((n) => n.isPinned).length;
  const pinnedFilteredNotes = sortedNotes.filter((n) => n.isPinned);
  const unpinnedFilteredNotes = sortedNotes.filter((n) => !n.isPinned);

  const renderNoteCard = (note: QuickNote) => (
    <div
      key={note.id}
      id={`note-card-${note.id}`}
      className={`p-6 rounded-3xl backdrop-blur-xl flex flex-col justify-between transition-all duration-300 space-y-4 relative ${
        note.isPinned
          ? 'bg-gradient-to-b from-cyan-950/25 via-[#0e111a]/95 to-[#0e111a]/85 border border-cyan-500/35 shadow-[0_0_25px_rgba(6,182,212,0.08)] ring-1 ring-cyan-500/20'
          : 'bg-[#0e111a]/80 border border-white/[0.07] hover:border-white/[0.14]'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {note.isPinned && (
              <span
                id={`pinned-badge-${note.id}`}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                title="Anchored to the top of list"
              >
                <Pin className="w-2.5 h-2.5 rotate-45 fill-cyan-400 text-cyan-400" />
                <span>PINNED</span>
              </span>
            )}
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
              {note.subject} • {note.category}
            </span>

            {/* Notebook Collection Badge */}
            {(() => {
              const currentFolder =
                folders.find((f) => f.id === (note.notebookId || 'notebook-general')) ||
                DEFAULT_NOTEBOOK_FOLDERS[4];
              const colorCfg =
                NOTEBOOK_COLOR_CONFIG[currentFolder.color] || NOTEBOOK_COLOR_CONFIG.cyan;
              return (
                <button
                  type="button"
                  id={`note-folder-badge-${note.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFolderId(currentFolder.id);
                  }}
                  className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all hover:scale-105 cursor-pointer ${colorCfg.badgeBg} ${colorCfg.badgeBorder} ${colorCfg.badgeText}`}
                  title={`Collection: ${currentFolder.name} (Click to view this notebook)`}
                >
                  {renderNotebookIcon(currentFolder.icon, 'w-2.5 h-2.5')}
                  <span>{currentFolder.name}</span>
                </button>
              );
            })()}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{note.updatedAt}</span>
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">
          {highlightMatch(note.title, searchQuery)}
        </h3>

        {/* Formulas Display Block */}
        {note.formulaSnippets && note.formulaSnippets.length > 0 && (
          <div className="my-3 p-3 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs text-cyan-300 space-y-1">
            {note.formulaSnippets.map((f, idx) => (
              <div key={idx} className="tracking-wide">
                {highlightMatch(f, searchQuery)}
              </div>
            ))}
          </div>
        )}

        <div className="mt-2.5">
          <MarkdownRenderer content={note.content} searchQuery={searchQuery} />
        </div>
      </div>

      {/* Tags & Action Bar */}
      <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-slate-400 font-mono"
            >
              #{highlightMatch(t, searchQuery)}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id={`pin-note-btn-${note.id}`}
            onClick={(e) => handleTogglePin(note.id, e)}
            className={`p-1.5 rounded-lg transition-all ${
              note.isPinned
                ? 'text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-500 hover:text-cyan-300 hover:bg-white/5'
            }`}
            title={note.isPinned ? 'Unpin note from top' : 'Anchor note to top of list'}
          >
            <Pin className={`w-3.5 h-3.5 rotate-45 ${note.isPinned ? 'fill-cyan-400 text-cyan-400' : ''}`} />
          </button>

          <button
            id={`star-note-btn-${note.id}`}
            onClick={() => handleToggleFavorite(note.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isFavorite
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-slate-500 hover:text-amber-300 hover:bg-white/5'
            }`}
            title={note.isFavorite ? 'Starred in Workspace' : 'Star Note'}
          >
            <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Quick Move to Notebook Selector */}
          <div className="relative inline-block" title="Move to Notebook Collection">
            <select
              aria-label="Move note to notebook folder"
              value={note.notebookId || 'notebook-general'}
              onChange={(e) => handleMoveNoteToFolder(note.id, e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#0e111a] text-white">
                  Move to: {f.name}
                </option>
              ))}
            </select>
            <div className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer pointer-events-none">
              <FolderInput className="w-3.5 h-3.5" />
            </div>
          </div>

          <button
            onClick={() => {
              setEditingNote(note);
              setEditTab('write');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            title="Edit Note (Auto-saves to store)"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setSelectedNoteForExport(note);
              setExportModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            title="Export Note (.md / .txt)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => openQuickFocus(20, `Revise: ${note.title}`, note.subject)}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium transition-all flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            <span>Revise</span>
          </button>

          <button
            onClick={() => handleDelete(note.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
              <FileText className="w-3.5 h-3.5" />
              <span>KNOWLEDGE RETRIEVAL</span>
            </div>

            {/* Subtle Auto-saved Status Indicator */}
            <div
              id="notes-autosaved-indicator"
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-all duration-300 ${
                autoSaveStatus === 'saving'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/20'
              }`}
              title="Note changes are debounced and automatically persisted to the workspace store"
            >
              {autoSaveStatus === 'saving' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                  </span>
                  <span className="font-medium text-amber-200">Saving...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400/90 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                  <span className="text-slate-300 font-medium">Auto-saved</span>
                  <span className="text-slate-500 text-[10px]">· {lastSavedTime}</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Notes & Formula Sheets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rapid formula recall cards, high-yield summary cheat-sheets, and quick reference anchors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            id="header-dictate-note-btn"
            type="button"
            onClick={() => {
              setCreateModalOpen(true);
              setTimeout(() => {
                handleToggleDictation('create', 'content');
              }, 150);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            title="Dictate a new note hands-free using Speech Recognition"
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>Dictate Note</span>
          </button>

          <button
            onClick={() => {
              setSelectedNoteForExport(null);
              setExportModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Notes</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sheet / Note</span>
          </button>
        </div>
      </div>

      {/* Notebook Collections & Folders Navigation */}
      <NotebookFolderBar
        folders={folders}
        activeFolderId={activeFolderId}
        notes={notes}
        onSelectFolder={(folderId) => {
          setActiveFolderId(folderId);
        }}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        onAddNoteToFolder={(folderId) => {
          setNewNotebookId(folderId);
          setActiveFolderId(folderId);
          setCreateModalOpen(true);
        }}
      />

      {/* Search & Filter Controls */}
      <div id="notes-search-container" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              id="notes-search-input"
              type="text"
              placeholder="Search notes by title, content, or formulas... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-[#0e111a]/80 border border-white/[0.08] focus:border-cyan-500 focus:bg-[#121624] text-white text-xs focus:outline-none placeholder:text-slate-500 transition-all shadow-inner"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {!searchQuery && (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-400">
                  /
                </span>
              )}

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                {pinnedTotalCount > 0 && ` · ${pinnedTotalCount} pinned`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              id="notes-subject-filter"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#0e111a]/80 border border-white/[0.08] text-white text-xs focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#0e111a]/80 border border-white/[0.08]">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                id="notes-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
                title="Sort notes (Pinned notes stay anchored to top)"
              >
                <option value="recent" className="bg-[#0e111a] text-white">Recently Updated</option>
                <option value="title-asc" className="bg-[#0e111a] text-white">Title (A → Z)</option>
                <option value="title-desc" className="bg-[#0e111a] text-white">Title (Z → A)</option>
                <option value="subject" className="bg-[#0e111a] text-white">Subject</option>
                <option value="category" className="bg-[#0e111a] text-white">Category</option>
              </select>
            </div>

            {/* Pinned Filter Toggle */}
            <button
              id="notes-pinned-filter-toggle"
              type="button"
              onClick={() => setOnlyPinned(!onlyPinned)}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                onlyPinned
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0e111a]/80 border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title={onlyPinned ? 'Showing pinned notes only' : 'Filter by pinned notes'}
            >
              <Pin className={`w-3.5 h-3.5 rotate-45 ${onlyPinned ? 'fill-cyan-400 text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Pinned</span>
              {pinnedTotalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                  {pinnedTotalCount}
                </span>
              )}
            </button>

            {/* Starred Filter Toggle */}
            <button
              id="notes-starred-filter-toggle"
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                onlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0e111a]/80 border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title={onlyFavorites ? 'Showing starred notes only' : 'Filter by starred notes'}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Starred</span>
            </button>
          </div>
        </div>

        {/* Active Search & Filter Tags Bar */}
        {(searchQuery || selectedSubject !== 'all' || onlyFavorites || onlyPinned || sortBy !== 'recent' || activeFolderId !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 flex-wrap gap-2 animate-fadeIn">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500">Filtered by:</span>
              {activeFolderId !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px]">
                  <Folder className="w-2.5 h-2.5" />
                  <span>Notebook: {folders.find((f) => f.id === activeFolderId)?.name || 'Collection'}</span>
                  <button
                    onClick={() => setActiveFolderId('all')}
                    className="hover:text-white ml-0.5"
                    title="View all collections"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                  Query: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-white ml-0.5"
                    title="Remove query filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSubject !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px]">
                  Subject: {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject('all')}
                    className="hover:text-white ml-0.5"
                    title="Remove subject filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {onlyPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px]">
                  <Pin className="w-2.5 h-2.5 rotate-45 fill-cyan-400" />
                  Pinned Only
                  <button
                    onClick={() => setOnlyPinned(false)}
                    className="hover:text-white ml-0.5"
                    title="Show all notes"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {onlyFavorites && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px]">
                  Starred Only
                  <button
                    onClick={() => setOnlyFavorites(false)}
                    className="hover:text-white ml-0.5"
                    title="Show all notes"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'recent' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 text-[11px]">
                  Sort: {sortLabels[sortBy]}
                  <button
                    onClick={() => setSortBy('recent')}
                    className="hover:text-white ml-0.5"
                    title="Reset to recently updated"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setOnlyFavorites(false);
                setOnlyPinned(false);
                setSortBy('recent');
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Notes Grid or Empty Search State */}
      {filteredNotes.length === 0 ? (
        <div
          id="notes-empty-search-state"
          className="p-10 rounded-3xl bg-[#0e111a]/60 border border-white/[0.08] backdrop-blur-xl text-center space-y-4 max-w-lg mx-auto my-8 animate-fadeIn"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No matching notes found</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {searchQuery
                ? `No notes or formula sheets match "${searchQuery}". Try a different keyword, check spelling, or clear active filters.`
                : 'No notes match the selected subject or star filter.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setOnlyFavorites(false);
                setOnlyPinned(false);
                setSortBy('recent');
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold transition-all"
            >
              Clear filters
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setNewTitle(searchQuery.trim());
                  setCreateModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create note "{searchQuery.slice(0, 18)}{searchQuery.length > 18 ? '...' : ''}"</span>
              </button>
            )}
          </div>
        </div>
      ) : pinnedFilteredNotes.length > 0 && unpinnedFilteredNotes.length > 0 && !onlyPinned ? (
        <div className="space-y-7">
          {/* Pinned Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-mono tracking-wide">
                <Pin className="w-3.5 h-3.5 rotate-45 fill-cyan-400 text-cyan-400" />
                <span>ANCHORED TO TOP ({pinnedFilteredNotes.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                · Pinned notes stay at top regardless of sorting
              </span>
              <div className="flex-1 h-px bg-cyan-500/20 ml-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {pinnedFilteredNotes.map(renderNoteCard)}
            </div>
          </div>

          {/* All Other Notes Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 px-1">
              <div className="text-xs font-bold text-slate-400 font-mono tracking-wide">
                <span>ALL OTHER NOTES ({unpinnedFilteredNotes.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                · Sorted by {sortLabels[sortBy]}
              </span>
              <div className="flex-1 h-px bg-white/[0.08] ml-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {unpinnedFilteredNotes.map(renderNoteCard)}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {sortedNotes.map(renderNoteCard)}
        </div>
      )}

      {/* Add Note Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f111a] border border-white/10 p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Add Note / Formula Card</span>
              </h3>
              <button onClick={closeCreateModal} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hands-Free Voice Dictation Banner */}
            <DictationControlBar
              context="create"
              isSupported={isSpeechSupported}
              isListening={isListening}
              activeContext={dictationContext}
              activeTarget={dictationTarget}
              interimTranscript={interimTranscript}
              speechError={speechError}
              onToggle={(target) => handleToggleDictation('create', target)}
              onSelectTarget={(target) => {
                setDictationTarget(target);
                dictationTargetRef.current = target;
                if (!isListening) {
                  handleToggleDictation('create', target);
                }
              }}
              onStop={() => {
                stopListening();
                setDictationContext(null);
              }}
            />

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Title</label>
                  <button
                    type="button"
                    onClick={() => handleToggleDictation('create', 'title')}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                      isListening && dictationContext === 'create' && dictationTarget === 'title'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title="Dictate into Title"
                  >
                    <Mic className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{isListening && dictationContext === 'create' && dictationTarget === 'title' ? 'Recording...' : 'Dictate'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Lens Formula & Sign Conventions"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Formula">Formula</option>
                    <option value="Concept">Concept</option>
                    <option value="Summary">Summary</option>
                    <option value="Quote">Quote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Notebook Collection</label>
                  <select
                    value={newNotebookId}
                    onChange={(e) => setNewNotebookId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Formulas / Math Snippets (one per line)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleDictation('create', 'formulas')}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                      isListening && dictationContext === 'create' && dictationTarget === 'formulas'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title="Dictate into Formulas"
                  >
                    <Mic className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{isListening && dictationContext === 'create' && dictationTarget === 'formulas' ? 'Recording...' : 'Dictate'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="1/f = 1/v - 1/u"
                  value={newFormulas}
                  onChange={(e) => setNewFormulas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-300">
                      Content & Markdown Notes
                    </label>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Markdown Enabled
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDictation('create', 'content')}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                      isListening && dictationContext === 'create' && dictationTarget === 'content'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title="Dictate into Content"
                  >
                    <Mic className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{isListening && dictationContext === 'create' && dictationTarget === 'content' ? 'Recording...' : 'Dictate'}</span>
                  </button>
                </div>

                {/* Markdown Formatting Toolbar */}
                <MarkdownEditorToolbar
                  textareaRef={createContentRef}
                  value={newContent}
                  onChange={setNewContent}
                  activeTab={createTab}
                  onTabChange={setCreateTab}
                />

                {createTab === 'write' ? (
                  <textarea
                    ref={createContentRef}
                    rows={4}
                    placeholder="Write your note with **bold**, *italics*, - list items, or use formatting buttons above..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                        e.preventDefault();
                        if (createContentRef.current) {
                          applyMarkdownFormat(createContentRef.current, 'bold', newContent, setNewContent);
                        }
                      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                        e.preventDefault();
                        if (createContentRef.current) {
                          applyMarkdownFormat(createContentRef.current, 'italic', newContent, setNewContent);
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                ) : (
                  <div className="w-full min-h-[110px] max-h-56 overflow-y-auto p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <MarkdownRenderer content={newContent} />
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 px-1">
                  <span>Formatting: **bold**, *italics*, - bullet item, 1. numbered, `code`, &gt; quote</span>
                  <span>{newContent.length} chars</span>
                </div>
              </div>

              {/* Pin Note Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${newIsPinned ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>
                    <Pin className={`w-3.5 h-3.5 rotate-45 ${newIsPinned ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Pin to Top</div>
                    <div className="text-[10px] text-slate-400">Anchor this note to the top of your list regardless of sorting</div>
                  </div>
                </div>
                <button
                  type="button"
                  id="create-note-pin-toggle"
                  onClick={() => setNewIsPinned(!newIsPinned)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    newIsPinned ? 'bg-cyan-500' : 'bg-white/10'
                  }`}
                  title="Toggle pinning note to top"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      newIsPinned ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Note Modal with Live Debounced Auto-Save */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#0f111a] border border-white/10 p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Edit Note</span>
                </h3>

                {/* Modal Live Auto-Save Indicator */}
                <div
                  id="modal-autosaved-indicator"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border transition-all ${
                    autoSaveStatus === 'saving'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Auto-saved · {lastSavedTime}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="edit-modal-pin-toggle"
                  onClick={() => {
                    const newPinStatus = !editingNote.isPinned;
                    handleUpdateNote(editingNote.id, { isPinned: newPinStatus });
                    showToast(newPinStatus ? 'Note anchored to top 📌' : 'Note unpinned from top');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    editingNote.isPinned
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                  title={editingNote.isPinned ? 'Unpin from top' : 'Anchor to top of list'}
                >
                  <Pin className={`w-3.5 h-3.5 rotate-45 ${editingNote.isPinned ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  <span>{editingNote.isPinned ? 'Pinned' : 'Pin to Top'}</span>
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hands-Free Voice Dictation Banner for Editing */}
            <DictationControlBar
              context="edit"
              isSupported={isSpeechSupported}
              isListening={isListening}
              activeContext={dictationContext}
              activeTarget={dictationTarget}
              interimTranscript={interimTranscript}
              speechError={speechError}
              onToggle={(target) => handleToggleDictation('edit', target)}
              onSelectTarget={(target) => {
                setDictationTarget(target);
                dictationTargetRef.current = target;
                if (!isListening) {
                  handleToggleDictation('edit', target);
                }
              }}
              onStop={() => {
                stopListening();
                setDictationContext(null);
              }}
            />

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Title</label>
                  <button
                    type="button"
                    onClick={() => handleToggleDictation('edit', 'title')}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                      isListening && dictationContext === 'edit' && dictationTarget === 'title'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title="Dictate into Title"
                  >
                    <Mic className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{isListening && dictationContext === 'edit' && dictationTarget === 'title' ? 'Recording...' : 'Dictate'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => handleUpdateNote(editingNote.id, { title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                  <select
                    value={editingNote.subject}
                    onChange={(e) => handleUpdateNote(editingNote.id, { subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={editingNote.category}
                    onChange={(e) => handleUpdateNote(editingNote.id, { category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Formula">Formula</option>
                    <option value="Concept">Concept</option>
                    <option value="Summary">Summary</option>
                    <option value="Quote">Quote</option>
                    <option value="Quick Note">Quick Note</option>
                    <option value="Revision Note">Revision Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Notebook Collection</label>
                  <select
                    value={editingNote.notebookId || 'notebook-general'}
                    onChange={(e) => handleUpdateNote(editingNote.id, { notebookId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Formulas / Math Snippets (one per line)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleDictation('edit', 'formulas')}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                      isListening && dictationContext === 'edit' && dictationTarget === 'formulas'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title="Dictate into Formulas"
                  >
                    <Mic className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{isListening && dictationContext === 'edit' && dictationTarget === 'formulas' ? 'Recording...' : 'Dictate'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="1/f = 1/v - 1/u"
                  value={(editingNote.formulaSnippets || []).join('\n')}
                  onChange={(e) =>
                    handleUpdateNote(editingNote.id, {
                      formulaSnippets: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-300">
                      Content & Markdown Notes
                    </label>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Markdown Enabled
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDictation('edit', 'content')}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                      isListening && dictationContext === 'edit' && dictationTarget === 'content'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title="Dictate into Content"
                  >
                    <Mic className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{isListening && dictationContext === 'edit' && dictationTarget === 'content' ? 'Recording...' : 'Dictate'}</span>
                  </button>
                </div>

                {/* Markdown Formatting Toolbar */}
                <MarkdownEditorToolbar
                  textareaRef={editContentRef}
                  value={editingNote.content}
                  onChange={(val) => handleUpdateNote(editingNote.id, { content: val })}
                  activeTab={editTab}
                  onTabChange={setEditTab}
                />

                {editTab === 'write' ? (
                  <textarea
                    ref={editContentRef}
                    rows={6}
                    placeholder="Notes on variables, derivations, sign convention rules, or quotes..."
                    value={editingNote.content}
                    onChange={(e) => handleUpdateNote(editingNote.id, { content: e.target.value })}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                        e.preventDefault();
                        if (editContentRef.current) {
                          applyMarkdownFormat(
                            editContentRef.current,
                            'bold',
                            editingNote.content,
                            (val) => handleUpdateNote(editingNote.id, { content: val })
                          );
                        }
                      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                        e.preventDefault();
                        if (editContentRef.current) {
                          applyMarkdownFormat(
                            editContentRef.current,
                            'italic',
                            editingNote.content,
                            (val) => handleUpdateNote(editingNote.id, { content: val })
                          );
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none leading-relaxed font-mono"
                  />
                ) : (
                  <div className="w-full min-h-[140px] max-h-64 overflow-y-auto p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <MarkdownRenderer content={editingNote.content} />
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 px-1">
                  <span>Supports **bold**, *italics*, - list items, 1. numbered, `code`, &gt; quotes</span>
                  <span>{editingNote.content.length} chars</span>
                </div>
              </div>

              {/* Pin Note Switch in Edit Modal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${editingNote.isPinned ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>
                    <Pin className={`w-3.5 h-3.5 rotate-45 ${editingNote.isPinned ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Anchored to Top</div>
                    <div className="text-[10px] text-slate-400">Keep this note pinned to the top of your list regardless of sort order</div>
                  </div>
                </div>
                <button
                  type="button"
                  id="edit-form-pin-toggle"
                  onClick={() => {
                    const newPinStatus = !editingNote.isPinned;
                    handleUpdateNote(editingNote.id, { isPinned: newPinStatus });
                    showToast(newPinStatus ? 'Note anchored to top 📌' : 'Note unpinned from top');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    editingNote.isPinned ? 'bg-cyan-500' : 'bg-white/10'
                  }`}
                  title="Toggle pinning note to top"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      editingNote.isPinned ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Optics, High-Yield, Derivation"
                  value={(editingNote.tags || []).join(', ')}
                  onChange={(e) =>
                    handleUpdateNote(editingNote.id, {
                      tags: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Cloud className="w-3 h-3 text-cyan-400" />
                  Auto-saving changes as you type (600ms debounce)
                </span>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  Done Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Notes Modal */}
      <ExportNotesModal
        isOpen={exportModalOpen}
        onClose={() => {
          setExportModalOpen(false);
          setSelectedNoteForExport(null);
        }}
        allNotes={notes}
        filteredNotes={filteredNotes}
        activeSubject={selectedSubject}
        selectedSingleNote={selectedNoteForExport}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#121522] border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
