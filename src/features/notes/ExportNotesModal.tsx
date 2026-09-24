import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  QuickNote,
  exportNotesToMarkdown,
  exportNotesToPlainText,
  exportSingleNoteToMarkdown,
  exportSingleNoteToPlainText,
  downloadFile,
} from './exportUtils';

interface ExportNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allNotes: QuickNote[];
  filteredNotes: QuickNote[];
  activeSubject: string;
  selectedSingleNote?: QuickNote | null;
}

export const ExportNotesModal: React.FC<ExportNotesModalProps> = ({
  isOpen,
  onClose,
  allNotes,
  filteredNotes,
  activeSubject,
  selectedSingleNote,
}) => {
  const [format, setFormat] = useState<'markdown' | 'plaintext'>('markdown');
  const [scope, setScope] = useState<'all' | 'filtered' | 'single'>(
    selectedSingleNote ? 'single' : 'all'
  );
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Target notes based on scope
  const targetNotes = useMemo(() => {
    if (scope === 'single' && selectedSingleNote) {
      return [selectedSingleNote];
    }
    if (scope === 'filtered') {
      return filteredNotes.length > 0 ? filteredNotes : allNotes;
    }
    return allNotes;
  }, [scope, selectedSingleNote, filteredNotes, allNotes]);

  // Generated content based on format & scope
  const generatedContent = useMemo(() => {
    if (scope === 'single' && selectedSingleNote) {
      return format === 'markdown'
        ? exportSingleNoteToMarkdown(selectedSingleNote)
        : exportSingleNoteToPlainText(selectedSingleNote);
    }

    const scopeTitle =
      scope === 'filtered' && activeSubject !== 'all'
        ? `${activeSubject} Notes`
        : 'Study Notes & Formula Sheets';

    return format === 'markdown'
      ? exportNotesToMarkdown(targetNotes, {
          scopeTitle,
          subjectFilter: activeSubject !== 'all' ? activeSubject : undefined,
        })
      : exportNotesToPlainText(targetNotes, {
          scopeTitle,
          subjectFilter: activeSubject !== 'all' ? activeSubject : undefined,
        });
  }, [format, scope, targetNotes, selectedSingleNote, activeSubject]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const prefix =
      scope === 'single' && selectedSingleNote
        ? selectedSingleNote.title.toLowerCase().replace(/[^\w-]/g, '_').slice(0, 24)
        : activeSubject !== 'all'
        ? `focus_${activeSubject.toLowerCase()}_notes`
        : 'focus_study_notes';

    if (format === 'markdown') {
      downloadFile(`${prefix}_${dateStr}.md`, generatedContent, 'text/markdown;charset=utf-8;');
    } else {
      downloadFile(`${prefix}_${dateStr}.txt`, generatedContent, 'text/plain;charset=utf-8;');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const lineCount = generatedContent.split('\n').length;
  const charCount = generatedContent.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl bg-[#0e111a] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#121522]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {format === 'markdown' ? <FileCode className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Export Saved Notes</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                  {format === 'markdown' ? '.MD' : '.TXT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Download formatted Markdown or clean plain text for Obsidian, Notion, or offline study.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="p-5 sm:p-6 border-b border-white/[0.06] bg-black/20 space-y-4 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
                Export File Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('markdown')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    format === 'markdown'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>Markdown (.md)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('plaintext')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    format === 'plaintext'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-300" />
                  <span>Plain Text (.txt)</span>
                </button>
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
                Notes Scope
              </label>
              <div className="flex gap-2">
                {selectedSingleNote && (
                  <button
                    type="button"
                    onClick={() => setScope('single')}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold transition-all truncate ${
                      scope === 'single'
                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Current Note ({selectedSingleNote.title.slice(0, 16)}...)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    scope === 'all'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  All Notes ({allNotes.length})
                </button>

                <button
                  type="button"
                  onClick={() => setScope('filtered')}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    scope === 'filtered'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Filtered View ({filteredNotes.length})
                </button>
              </div>
            </div>
          </div>

          {/* Quick info metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 font-mono">
            <div className="flex items-center gap-3">
              <span>
                Exporting: <strong className="text-slate-200">{targetNotes.length} note(s)</strong>
              </span>
              <span>•</span>
              <span>{lineCount} lines</span>
              <span>•</span>
              <span>{(charCount / 1024).toFixed(1)} KB</span>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>
        </div>

        {/* Live File Preview Area */}
        {showPreview && (
          <div className="flex-1 overflow-hidden p-5 sm:p-6 flex flex-col min-h-0 bg-[#08090f]">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Live Generated Document Preview
              </span>
              <span className="text-[11px] text-slate-500">
                Ready to import into Obsidian, VS Code, Notion, or Apple Notes
              </span>
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl bg-black/60 border border-white/[0.08] p-4 font-mono text-xs text-slate-300 leading-relaxed select-text whitespace-pre-wrap">
              {generatedContent}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#121522]/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-400 order-2 sm:order-1 text-center sm:text-left">
            Formula snippets, tags, and formatting are preserved for Markdown parsers.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download {format === 'markdown' ? '.md File' : '.txt File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
