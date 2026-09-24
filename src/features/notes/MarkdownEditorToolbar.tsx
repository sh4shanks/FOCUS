import React from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading3,
  Quote,
  Code,
  Eye,
  Edit3,
  HelpCircle,
} from 'lucide-react';

export type MarkdownFormatType =
  | 'bold'
  | 'italic'
  | 'bullet'
  | 'number'
  | 'heading'
  | 'quote'
  | 'code';

export function applyMarkdownFormat(
  textarea: HTMLTextAreaElement,
  format: MarkdownFormatType,
  currentValue: string,
  onChange: (val: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = currentValue.substring(start, end);

  let replacement = '';
  let selectStart = start;
  let selectEnd = end;

  switch (format) {
    case 'bold': {
      if (selectedText) {
        replacement = `**${selectedText}**`;
        selectStart = start + 2;
        selectEnd = end + 2;
      } else {
        replacement = '**bold text**';
        selectStart = start + 2;
        selectEnd = start + 11;
      }
      break;
    }
    case 'italic': {
      if (selectedText) {
        replacement = `*${selectedText}*`;
        selectStart = start + 1;
        selectEnd = end + 1;
      } else {
        replacement = '*italic text*';
        selectStart = start + 1;
        selectEnd = start + 12;
      }
      break;
    }
    case 'bullet': {
      if (selectedText) {
        const lines = selectedText.split('\n');
        const formatted = lines
          .map((line) => (line.trim().startsWith('- ') ? line.replace(/^\s*-\s+/, '') : `- ${line}`))
          .join('\n');
        replacement = formatted;
        selectStart = start;
        selectEnd = start + formatted.length;
      } else {
        const needsNewlineBefore = start > 0 && currentValue[start - 1] !== '\n';
        replacement = `${needsNewlineBefore ? '\n' : ''}- List item`;
        selectStart = start + (needsNewlineBefore ? 3 : 2);
        selectEnd = selectStart + 9;
      }
      break;
    }
    case 'number': {
      if (selectedText) {
        const lines = selectedText.split('\n');
        let counter = 1;
        const formatted = lines
          .map((line) => {
            const trimmed = line.trim();
            if (/^\d+\.\s+/.test(trimmed)) {
              return line.replace(/^\s*\d+\.\s+/, '');
            }
            return `${counter++}. ${line}`;
          })
          .join('\n');
        replacement = formatted;
        selectStart = start;
        selectEnd = start + formatted.length;
      } else {
        const needsNewlineBefore = start > 0 && currentValue[start - 1] !== '\n';
        replacement = `${needsNewlineBefore ? '\n' : ''}1. List item`;
        selectStart = start + (needsNewlineBefore ? 4 : 3);
        selectEnd = selectStart + 9;
      }
      break;
    }
    case 'heading': {
      if (selectedText) {
        replacement = `### ${selectedText}`;
        selectStart = start + 4;
        selectEnd = end + 4;
      } else {
        const needsNewlineBefore = start > 0 && currentValue[start - 1] !== '\n';
        replacement = `${needsNewlineBefore ? '\n' : ''}### Heading`;
        selectStart = start + (needsNewlineBefore ? 5 : 4);
        selectEnd = selectStart + 7;
      }
      break;
    }
    case 'quote': {
      if (selectedText) {
        const lines = selectedText.split('\n');
        const formatted = lines.map((l) => `> ${l}`).join('\n');
        replacement = formatted;
        selectStart = start;
        selectEnd = start + formatted.length;
      } else {
        const needsNewlineBefore = start > 0 && currentValue[start - 1] !== '\n';
        replacement = `${needsNewlineBefore ? '\n' : ''}> Key insight or quote`;
        selectStart = start + (needsNewlineBefore ? 3 : 2);
        selectEnd = selectStart + 20;
      }
      break;
    }
    case 'code': {
      if (selectedText) {
        replacement = `\`${selectedText}\``;
        selectStart = start + 1;
        selectEnd = end + 1;
      } else {
        replacement = '`code`';
        selectStart = start + 1;
        selectEnd = start + 5;
      }
      break;
    }
  }

  const newValue = currentValue.substring(0, start) + replacement + currentValue.substring(end);
  onChange(newValue);

  // Re-focus and set selection range
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(selectStart, selectEnd);
  }, 0);
}

interface MarkdownEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (newValue: string) => void;
  activeTab?: 'write' | 'preview';
  onTabChange?: (tab: 'write' | 'preview') => void;
  showPreviewToggle?: boolean;
}

export const MarkdownEditorToolbar: React.FC<MarkdownEditorToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  activeTab = 'write',
  onTabChange,
  showPreviewToggle = true,
}) => {
  const handleFormat = (format: MarkdownFormatType) => {
    if (!textareaRef.current) return;
    if (activeTab === 'preview' && onTabChange) {
      onTabChange('write');
    }
    applyMarkdownFormat(textareaRef.current, format, value, onChange);
  };

  return (
    <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-[#090b11] border border-white/[0.08] mb-2 flex-wrap">
      {/* Formatting Action Buttons */}
      <div className="flex items-center gap-0.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95"
          title="Bold (**text**) • Ctrl+B"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95"
          title="Italic (*text*) • Ctrl+I"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        <button
          type="button"
          onClick={() => handleFormat('bullet')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95 flex items-center gap-0.5"
          title="Bullet List (- item)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleFormat('number')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95 flex items-center gap-0.5"
          title="Numbered List (1. item)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        <button
          type="button"
          onClick={() => handleFormat('heading')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95"
          title="Heading (### Title)"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleFormat('quote')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95"
          title="Quote / Highlight (> insight)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleFormat('code')}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 active:scale-95"
          title="Inline Code (`code`)"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Write / Preview Tab Switcher */}
      {showPreviewToggle && onTabChange && (
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
          <button
            type="button"
            onClick={() => onTabChange('write')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
              activeTab === 'write'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('preview')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
              activeTab === 'preview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      )}
    </div>
  );
};
