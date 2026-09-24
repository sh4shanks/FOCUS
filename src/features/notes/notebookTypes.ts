import React from 'react';
import {
  Folder,
  BookOpen,
  Zap,
  Sparkles,
  Bookmark,
  FileText,
  FolderOpen,
  Tag,
  Layers,
} from 'lucide-react';

export type NotebookColor = 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'blue';
export type NotebookIconName = 'Folder' | 'BookOpen' | 'Zap' | 'Sparkles' | 'Bookmark' | 'FileText' | 'Layers';

export interface NotebookFolder {
  id: string;
  name: string;
  color: NotebookColor;
  icon: NotebookIconName;
  description?: string;
  isDefault?: boolean;
  createdAt: string;
}

export const DEFAULT_NOTEBOOK_FOLDERS: NotebookFolder[] = [
  {
    id: 'notebook-formulas',
    name: 'Formula Sheets & Derivations',
    color: 'cyan',
    icon: 'Zap',
    description: 'Curated equations, optics formulas, and mathematical derivations',
    isDefault: true,
    createdAt: '2026-09-01',
  },
  {
    id: 'notebook-concepts',
    name: 'Concept Syntheses',
    color: 'violet',
    icon: 'BookOpen',
    description: 'Deep conceptual breakdowns, laws, and theory summaries',
    isDefault: true,
    createdAt: '2026-09-01',
  },
  {
    id: 'notebook-revision',
    name: 'Exam High-Yield & Revision',
    color: 'amber',
    icon: 'Sparkles',
    description: 'High-yield cram checklists, reaction orders, and pitfall alerts',
    isDefault: true,
    createdAt: '2026-09-01',
  },
  {
    id: 'notebook-quotes',
    name: 'Quotes & Literature Motifs',
    color: 'rose',
    icon: 'Bookmark',
    description: 'Memorable Shakespeare quotes, act scene analysis, and rhetorical themes',
    isDefault: true,
    createdAt: '2026-09-01',
  },
  {
    id: 'notebook-general',
    name: 'General & Quick Notes',
    color: 'emerald',
    icon: 'Folder',
    description: 'Everyday scratchpad, brainstorms, and quick uncategorized notes',
    isDefault: true,
    createdAt: '2026-09-01',
  },
];

export const NOTEBOOK_COLOR_CONFIG: Record<
  NotebookColor,
  {
    label: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    activeBorder: string;
    activeBg: string;
    activeGlow: string;
    dotBg: string;
    cardBorderHover: string;
  }
> = {
  cyan: {
    label: 'Cyan',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/25',
    badgeText: 'text-cyan-300',
    activeBorder: 'border-cyan-500/60',
    activeBg: 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5',
    activeGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    dotBg: 'bg-cyan-400',
    cardBorderHover: 'hover:border-cyan-500/40',
  },
  violet: {
    label: 'Violet',
    badgeBg: 'bg-violet-500/10',
    badgeBorder: 'border-violet-500/25',
    badgeText: 'text-violet-300',
    activeBorder: 'border-violet-500/60',
    activeBg: 'bg-gradient-to-r from-violet-500/20 to-violet-500/5',
    activeGlow: 'shadow-[0_0_15px_rgba(139,92,246,0.25)]',
    dotBg: 'bg-violet-400',
    cardBorderHover: 'hover:border-violet-500/40',
  },
  amber: {
    label: 'Amber',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/25',
    badgeText: 'text-amber-300',
    activeBorder: 'border-amber-500/60',
    activeBg: 'bg-gradient-to-r from-amber-500/20 to-amber-500/5',
    activeGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    dotBg: 'bg-amber-400',
    cardBorderHover: 'hover:border-amber-500/40',
  },
  emerald: {
    label: 'Emerald',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/25',
    badgeText: 'text-emerald-300',
    activeBorder: 'border-emerald-500/60',
    activeBg: 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5',
    activeGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    dotBg: 'bg-emerald-400',
    cardBorderHover: 'hover:border-emerald-500/40',
  },
  rose: {
    label: 'Rose',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/25',
    badgeText: 'text-rose-300',
    activeBorder: 'border-rose-500/60',
    activeBg: 'bg-gradient-to-r from-rose-500/20 to-rose-500/5',
    activeGlow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    dotBg: 'bg-rose-400',
    cardBorderHover: 'hover:border-rose-500/40',
  },
  blue: {
    label: 'Blue',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/25',
    badgeText: 'text-blue-300',
    activeBorder: 'border-blue-500/60',
    activeBg: 'bg-gradient-to-r from-blue-500/20 to-blue-500/5',
    activeGlow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    dotBg: 'bg-blue-400',
    cardBorderHover: 'hover:border-blue-500/40',
  },
};

export const renderNotebookIcon = (icon: NotebookIconName, className = 'w-4 h-4'): React.ReactElement => {
  switch (icon) {
    case 'Zap':
      return React.createElement(Zap, { className });
    case 'BookOpen':
      return React.createElement(BookOpen, { className });
    case 'Sparkles':
      return React.createElement(Sparkles, { className });
    case 'Bookmark':
      return React.createElement(Bookmark, { className });
    case 'FileText':
      return React.createElement(FileText, { className });
    case 'Layers':
      return React.createElement(Layers, { className });
    case 'Folder':
    default:
      return React.createElement(Folder, { className });
  }
};

const STORAGE_KEY = 'focus_notebook_folders_v1';

export function loadNotebookFolders(): NotebookFolder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse notebook folders from storage', err);
  }
  return DEFAULT_NOTEBOOK_FOLDERS;
}

export function saveNotebookFolders(folders: NotebookFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save notebook folders', err);
  }
}
