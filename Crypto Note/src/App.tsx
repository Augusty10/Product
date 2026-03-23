import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, ShieldAlert } from 'lucide-react';
import { Note, EncryptedNote } from './types';
import { encryptData, decryptData } from './services/encryption';
import { storage } from './services/storage';
import { PasswordGate } from './components/PasswordGate';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { cn } from './utils';

type View = 'all' | 'pinned' | 'archived' | 'trash';

export default function App() {
  const [password, setPassword] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeView, setActiveView] = useState<View>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load and decrypt notes
  useEffect(() => {
    if (!password) return;

    const loadNotes = async () => {
      try {
        const encryptedNotes = await storage.getAll();
        const decryptedNotes = encryptedNotes.map(en => {
          try {
            const data = JSON.parse(decryptData(en.encryptedData, password));
            return {
              ...en,
              title: data.title,
              content: data.content,
            } as Note;
          } catch (e) {
            console.error('Failed to decrypt note', en.id);
            return null;
          }
        }).filter((n): n is Note => n !== null);

        setNotes(decryptedNotes.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (error) {
        console.error('Failed to load notes', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [password]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (activeView === 'pinned') {
      result = result.filter(n => n.isPinned && !n.isArchived);
    } else if (activeView === 'archived') {
      result = result.filter(n => n.isArchived);
    } else {
      result = result.filter(n => !n.isArchived);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [notes, activeView, searchQuery]);

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (!password) return;

    const now = Date.now();
    const newNote: Note = editingNote 
      ? { ...editingNote, ...noteData, updatedAt: now }
      : {
          id: crypto.randomUUID(),
          title: noteData.title || '',
          content: noteData.content || '',
          isPinned: noteData.isPinned || false,
          isArchived: noteData.isArchived || false,
          createdAt: now,
          updatedAt: now,
        };

    // Encrypt content
    const encryptedData = encryptData(JSON.stringify({
      title: newNote.title,
      content: newNote.content
    }), password);

    const encryptedNote: EncryptedNote = {
      id: newNote.id,
      encryptedData,
      isPinned: newNote.isPinned,
      isArchived: newNote.isArchived,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    };

    await storage.save(encryptedNote);
    
    setNotes(prev => {
      const index = prev.findIndex(n => n.id === newNote.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newNote;
        return updated.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return [newNote, ...prev];
    });

    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (id: string) => {
    await storage.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleTogglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const updatedNote = { ...note, isPinned: !note.isPinned };
      await handleSaveNote(updatedNote);
    }
  };

  const handleToggleArchive = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const updatedNote = { ...note, isArchived: !note.isArchived };
      await handleSaveNote(updatedNote);
    }
  };

  if (!password) {
    return <PasswordGate onUnlock={setPassword} />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLock={() => setPassword(null)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="p-8 flex items-center justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your encrypted vault..."
              className="w-full bg-white border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
            />
          </div>
          
          <button
            onClick={() => { setEditingNote(null); setIsEditorOpen(true); }}
            className="ml-6 px-6 py-3.5 bg-zinc-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </header>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(n) => { setEditingNote(n); setIsEditorOpen(true); }}
                    onTogglePin={handleTogglePin}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-4">
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium">No notes found in this vault</p>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="text-emerald-500 font-bold hover:underline"
              >
                Create your first encrypted note
              </button>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onClose={() => { setIsEditorOpen(false); setEditingNote(null); }}
            onDelete={handleDeleteNote}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
}

