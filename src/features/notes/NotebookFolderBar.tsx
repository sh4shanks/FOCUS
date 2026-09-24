import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Layers,
  Zap,
  BookOpen,
  Bookmark,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  NotebookFolder,
  NotebookColor,
  NotebookIconName,
  NOTEBOOK_COLOR_CONFIG,
  renderNotebookIcon,
} from './notebookTypes';
import { QuickNote } from './exportUtils';

interface NotebookFolderBarProps {
  folders: NotebookFolder[];
  activeFolderId: string; // 'all' or notebook id
  onSelectFolder: (folderId: string) => void;
  notes: QuickNote[];
  onCreateFolder: (folder: Omit<NotebookFolder, 'id' | 'createdAt'>) => void;
  onUpdateFolder: (id: string, updates: Partial<NotebookFolder>) => void;
  onDeleteFolder: (id: string) => void;
  onAddNoteToFolder: (folderId: string) => void;
}

export const NotebookFolderBar: React.FC<NotebookFolderBarProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  notes,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onAddNoteToFolder,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<NotebookFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<NotebookFolder | null>(null);

  // Form states for Create/Edit Modal
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState<NotebookColor>('cyan');
  const [formIcon, setFormIcon] = useState<NotebookIconName>('Folder');
  const [formDescription, setFormDescription] = useState('');

  const openCreateModal = () => {
    setEditingFolder(null);
    setFormName('');
    setFormColor('cyan');
    setFormIcon('Folder');
    setFormDescription('');
    setModalOpen(true);
  };

  const openEditModal = (folder: NotebookFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setFormName(folder.name);
    setFormColor(folder.color);
    setFormIcon(folder.icon);
    setFormDescription(folder.description || '');
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingFolder) {
      onUpdateFolder(editingFolder.id, {
        name: formName.trim(),
        color: formColor,
        icon: formIcon,
        description: formDescription.trim(),
      });
    } else {
      onCreateFolder({
        name: formName.trim(),
        color: formColor,
        icon: formIcon,
        description: formDescription.trim(),
      });
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (folderToDelete) {
      onDeleteFolder(folderToDelete.id);
      setFolderToDelete(null);
    }
  };

  // Calculate note counts per folder
  const getNoteCount = (folderId: string) => {
    if (folderId === 'all') return notes.length;
    return notes.filter((n) => (n.notebookId || 'notebook-general') === folderId).length;
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const colorOptions: NotebookColor[] = ['cyan', 'violet', 'amber', 'emerald', 'rose', 'blue'];
  const iconOptions: NotebookIconName[] = [
    'Folder',
    'BookOpen',
    'Zap',
    'Sparkles',
    'Bookmark',
    'FileText',
    'Layers',
  ];

  return (
    <div id="notebook-folders-section" className="space-y-3">
      {/* Top Header Label */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Notebook Collections & Folders
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({folders.length} collections)
          </span>
        </div>

        <button
          type="button"
          id="create-notebook-folder-btn"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Create a new notebook collection"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Notebook</span>
        </button>
      </div>

      {/* Folders Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar">
        {/* All Notes Tab */}
        <button
          type="button"
          id="folder-tab-all"
          onClick={() => onSelectFolder('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all shrink-0 cursor-pointer border ${
            activeFolderId === 'all'
              ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
              : 'bg-[#0e111a]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-cyan-400" />
          <span>All Notes</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
              activeFolderId === 'all'
                ? 'bg-cyan-500/30 text-cyan-200'
                : 'bg-white/10 text-slate-400'
            }`}
          >
            {notes.length}
          </span>
        </button>

        {/* Individual Folder Tabs */}
        {folders.map((folder) => {
          const count = getNoteCount(folder.id);
          const colorCfg = NOTEBOOK_COLOR_CONFIG[folder.color] || NOTEBOOK_COLOR_CONFIG.cyan;
          const isActive = activeFolderId === folder.id;

          return (
            <div
              key={folder.id}
              className={`group relative flex items-center rounded-2xl transition-all shrink-0 border ${
                isActive
                  ? `${colorCfg.activeBg} ${colorCfg.activeBorder} ${colorCfg.activeGlow} ring-1 ring-white/10`
                  : `bg-[#0e111a]/80 border-white/[0.08] ${colorCfg.cardBorderHover}`
              }`}
            >
              <button
                type="button"
                id={`folder-tab-${folder.id}`}
                onClick={() => onSelectFolder(folder.id)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium cursor-pointer"
                title={folder.description || folder.name}
              >
                <span className={isActive ? colorCfg.badgeText : 'text-slate-400'}>
                  {renderNotebookIcon(folder.icon, 'w-3.5 h-3.5')}
                </span>
                <span className={isActive ? 'text-white font-semibold' : 'text-slate-300'}>
                  {folder.name}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                    isActive ? colorCfg.badgeBg + ' ' + colorCfg.badgeText : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>

              {/* Action Buttons for Custom Folders or quick edit */}
              {!folder.isDefault && (
                <div className="flex items-center pr-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => openEditModal(folder, e)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    title="Edit notebook collection"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToDelete(folder);
                    }}
                    className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                    title="Delete notebook collection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Folder Spotlight Banner */}
      {activeFolder && activeFolderId !== 'all' && (
        <div
          id="active-folder-banner"
          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between flex-wrap gap-3 ${
            NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeBg
          } ${NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeBorder}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeBg
              } ${NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeBorder} ${
                NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeText
              }`}
            >
              {renderNotebookIcon(activeFolder.icon, 'w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {activeFolder.name}
                </h4>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeBg
                  } ${NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeBorder} ${
                    NOTEBOOK_COLOR_CONFIG[activeFolder.color].badgeText
                  }`}
                >
                  {getNoteCount(activeFolder.id)} {getNoteCount(activeFolder.id) === 1 ? 'note' : 'notes'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeFolder.description || 'Collection of related revision sheets and study notes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="add-note-to-active-folder-btn"
              onClick={() => onAddNoteToFolder(activeFolder.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Note Here</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectFolder('all')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
              title="Show all notes regardless of folder"
            >
              View All Notes
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Notebook Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0f111a] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingFolder ? 'Edit Notebook Collection' : 'Create Notebook Collection'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Collection Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Reactions, Exam Cram 2026..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Color Theme
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorOptions.map((c) => {
                    const cfg = NOTEBOOK_COLOR_CONFIG[c];
                    const isSelected = formColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? `${cfg.badgeBg} ${cfg.activeBorder} ${cfg.badgeText} ring-1 ring-white/20`
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotBg}`} />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Collection Icon
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {iconOptions.map((ic) => {
                    const isSelected = formIcon === ic;
                    return (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setFormIcon(ic)}
                        className={`p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                        title={ic}
                      >
                        {renderNotebookIcon(ic, 'w-4 h-4')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What topics or study goals are stored here?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {editingFolder ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f111a] border border-rose-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Delete Notebook Collection</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-semibold">{folderToDelete.name}</strong>?
            </p>
            <p className="text-[11px] text-slate-400">
              Notes in this collection will remain safe and be moved to the <strong className="text-cyan-300">General & Quick Notes</strong> notebook.
            </p>
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md"
              >
                Delete Notebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
