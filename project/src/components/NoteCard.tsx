import React, { useState } from 'react';
import { Pin, Trash2, Edit3, Calendar, ArrowUpRight, Info, Clock, History } from 'lucide-react';
import { Note } from '../types/Note';

interface NoteCardProps {
  note: Note;
  onDelete: (_id: string) => void;
  onTogglePin: (_id: string) => void;
  onEditClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onTogglePin, onEditClick }) => {
  const [showInfo, setShowInfo] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  return (
    <div 
      className={`group relative zen-card zen-glass rounded-3xl p-7 flex flex-col h-full animate-fade-in border-none ring-1 ring-stone-100 dark:ring-stone-900 transition-all duration-500 ${note.isPinned ? 'ring-stone-400 dark:ring-stone-600' : ''} ${showInfo ? 'shadow-2xl shadow-stone-200/50 dark:shadow-black/50 ring-stone-900 dark:ring-stone-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400">
          {note.category}
        </span>
        
        {note.isPinned && (
          <Pin className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100 fill-current" />
        )}
      </div>

      <div className="flex-grow min-h-[100px]">
        <h3 className="text-xl font-medium text-stone-900 dark:text-stone-100 mb-3 leading-tight tracking-tight">
          {note.title}
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed line-clamp-4 font-light">
          {note.content}
        </p>
      </div>

      <div className="mt-8 pt-5 border-t border-stone-100 dark:border-stone-900/50 flex items-center justify-between">
        <p className="text-[10px] text-stone-400 flex items-center gap-1.5 uppercase tracking-tighter">
          <Calendar className="w-3 h-3" /> {formatDate(note.createdAt)}
        </p>
        
        <ArrowUpRight className={`w-4 h-4 text-stone-300 transition-all duration-300 ${showInfo ? 'rotate-45 text-stone-900 dark:text-stone-100' : 'group-hover:text-stone-900 dark:group-hover:text-stone-100 opacity-0 group-hover:opacity-100'}`} />
      </div>

      {/* Metadata Expansion Pane */}
      <div className={`zen-expandable-grid ${showInfo ? 'is-expanded' : ''}`}>
        <div className="zen-expandable-content">
          <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-900/50 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-[0.15em] text-stone-400 font-bold mb-0.5">Created</p>
                 <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">{formatDateTime(note.createdAt)}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-stone-400" />
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-[0.15em] text-stone-400 font-bold mb-0.5">Modified</p>
                 <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">{formatDateTime(note.updatedAt)}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Overlay Actions */}
      <div className={`absolute top-4 right-4 flex gap-1 transition-all duration-500 ${showInfo ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0'}`}>
        <button
          onClick={() => onTogglePin(note._id)}
          className={`p-2.5 rounded-full bg-white dark:bg-stone-900 shadow-xl border transition-all hover:scale-110 ${note.isPinned ? 'text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700' : 'text-stone-400 border-stone-100 dark:border-stone-800'}`}
          title="Toggle Pin"
        >
          <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2.5 rounded-full bg-white dark:bg-stone-900 shadow-xl border transition-all hover:scale-110 ${showInfo ? 'text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-600' : 'text-stone-400 border-stone-100 dark:border-stone-800'}`}
          title="Note Information"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          onClick={onEditClick}
          className="p-2.5 rounded-full bg-white dark:bg-stone-900 shadow-xl border border-stone-100 dark:border-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-all hover:scale-110"
          title="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(note._id)}
          className="p-2.5 rounded-full bg-white dark:bg-stone-900 shadow-xl border border-stone-100 dark:border-stone-800 text-stone-400 hover:text-red-500 transition-all hover:scale-110"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;