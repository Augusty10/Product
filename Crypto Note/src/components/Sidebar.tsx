import React from 'react';
import { motion } from 'motion/react';
import { 
  StickyNote, 
  Pin, 
  Archive, 
  Trash2, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils';

type View = 'all' | 'pinned' | 'archived' | 'trash';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onLock: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLock }) => {
  const menuItems = [
    { id: 'all', label: 'All Notes', icon: StickyNote },
    { id: 'pinned', label: 'Pinned', icon: Pin },
    { id: 'archived', label: 'Archived', icon: Archive },
  ] as const;

  return (
    <div className="w-72 h-screen flex flex-col bg-white border-r border-zinc-100 p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">CryptNote</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200",
              activeView === item.id 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10" 
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-zinc-100 space-y-2">
        <button
          onClick={onLock}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Lock Vault
        </button>
        <div className="px-4 py-2">
          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Offline Encryption Active
          </p>
        </div>
      </div>
    </div>
  );
};
