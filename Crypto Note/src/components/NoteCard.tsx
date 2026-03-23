import React from 'react';
import { motion } from 'motion/react';
import { Pin, Archive, Trash2, Clock } from 'lucide-react';
import { Note } from '../types';
import { cn } from '../utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onTogglePin, 
  onToggleArchive, 
  onDelete 
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(note.updatedAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer",
        note.isPinned ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-zinc-100 shadow-sm hover:shadow-md"
      )}
      onClick={() => onEdit(note)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-zinc-900 line-clamp-1 pr-8">
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              note.isPinned ? "text-emerald-600 bg-emerald-100" : "text-zinc-400 hover:bg-zinc-100"
            )}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleArchive(note.id); }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              note.isArchived ? "text-amber-600 bg-amber-100" : "text-zinc-400 hover:bg-zinc-100"
            )}
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-zinc-600 text-sm line-clamp-4 mb-4 leading-relaxed">
        {note.content || 'Empty note...'}
      </p>

      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <Clock className="w-3 h-3" />
        {formattedDate}
      </div>
    </motion.div>
  );
};
