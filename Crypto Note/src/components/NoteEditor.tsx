import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Pin, Archive } from 'lucide-react';
import { Note } from '../types';
import { cn } from '../utils';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isArchived, setIsArchived] = useState(note?.isArchived || false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      setIsArchived(note.isArchived);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsArchived(false);
    }
  }, [note]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    onSave({
      title,
      content,
      isPinned,
      isArchived,
      updatedAt: Date.now()
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
      onClick={handleSave}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isPinned ? "bg-emerald-100 text-emerald-600" : "hover:bg-zinc-100 text-zinc-400"
              )}
            >
              <Pin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsArchived(!isArchived)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isArchived ? "bg-amber-100 text-amber-600" : "hover:bg-zinc-100 text-zinc-400"
              )}
            >
              <Archive className="w-5 h-5" />
            </button>
            {note && onDelete && (
              <button
                onClick={() => { onDelete(note.id); onClose(); }}
                className="p-2 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full text-3xl font-bold text-zinc-900 placeholder-zinc-200 focus:outline-none"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your secret thoughts..."
            className="w-full min-h-[300px] text-lg text-zinc-600 placeholder-zinc-200 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="p-6 bg-zinc-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-zinc-500 hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Note
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
