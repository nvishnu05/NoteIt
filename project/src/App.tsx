import { useState, useMemo, useEffect } from 'react';
import { Wind, Moon, Sun, Archive, AlertCircle, X } from 'lucide-react';
import { Note, NoteFormData } from './types/Note';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import SearchBar from './components/SearchBar';
import ZenProgress from './components/ZenProgress';
import { useDarkMode } from './hooks/useDarkMode';

// Dynamic Backend Detection logic
const getApiBaseUrl = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const prodUrl = import.meta.env.VITE_API_URL || 'https://noteit-backend-production.up.railway.app';
  const localUrl = 'http://localhost:5000';
  return isLocal ? localUrl : prodUrl;
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/notes`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setNotes(data.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        })));
        setError(null);
      } catch (err: any) {
        console.error('[API Error]', err);
        setError(`Unable to reach the backend. Please ensure the server is running on ${API_BASE_URL} and check CORS settings.`);
      }
    };
    fetchNotes();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(notes.map(note => note.category)));
    return uniqueCategories.sort();
  }, [notes]);

  const streak = useMemo(() => {
    if (notes.length === 0) return 0;
    
    // Get unique dates of notes (YYYY-MM-DD)
    const dates = Array.from(new Set(notes.map(n => new Date(n.createdAt).toDateString())))
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    // Check if there's a note today or yesterday to see if streak is active
    const hasNoteRecently = dates.some(d => d === todayTimestamp || d === todayTimestamp - 86400000);
    if (!hasNoteRecently) return 0;

    // Start checking from the most recent note date
    let lastDateChecked = dates[0];
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      if (lastDateChecked - dates[i] === 86400000) {
        currentStreak++;
        lastDateChecked = dates[i];
      } else {
        break;
      }
    }
    return currentStreak;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [notes, searchTerm, selectedCategory]);

  const handleAddNote = async (noteData: NoteFormData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!res.ok) throw new Error(`Add failed`);
      const newNote = await res.json();
      newNote.createdAt = new Date(newNote.createdAt);
      newNote.updatedAt = new Date(newNote.updatedAt);
      setNotes(prev => [newNote, ...prev]);
      if (searchTerm) setSearchTerm('');
      if (selectedCategory && selectedCategory !== newNote.category) setSelectedCategory('');
    } catch (err) {
      alert('Failed to store note.');
    }
  };

  const handleUpdateNote = async (_id: string, noteData: NoteFormData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!res.ok) throw new Error(`Update failed`);
      const updatedNote = await res.json();
      updatedNote.createdAt = new Date(updatedNote.createdAt);
      updatedNote.updatedAt = new Date(updatedNote.updatedAt);
      setNotes(prev => prev.map(note => note._id === _id ? updatedNote : note));
      setNoteToEdit(null); // Close modal
    } catch (err) {
      alert('Failed to update note.');
    }
  };

  const handleDeleteNote = (_id: string) => {
    setNoteToDelete(_id);
    setShowDeleteModal(true);
  };

  const confirmDeleteNote = async () => {
    if (noteToDelete) {
      try {
        await fetch(`${API_BASE_URL}/api/notes/${noteToDelete}`, { method: 'DELETE' });
        setNotes(prev => prev.filter(note => note._id !== noteToDelete));
        setShowDeleteModal(false);
        setNoteToDelete(null);
      } catch (err) {
        console.error('[API] Delete failed:', err);
      }
    }
  };

  const handleTogglePin = async (_id: string) => {
    const note = notes.find(n => n._id === _id);
    if (!note) return;
    await handleUpdateNote(_id, { ...note, isPinned: !note.isPinned });
  };

  const handleExportNotes = () => {
    const dataStr = JSON.stringify({ notes, exportDate: new Date().toISOString() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `zen_notes_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const confirmClearAllNotes = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notes`, { method: 'DELETE' });
      setNotes([]);
      setShowClearAllModal(false);
    } catch (err) {
      console.error('[API] Clear all failed:', err);
    }
  };

  const isAnyModalOpen = noteToEdit || showDeleteModal || showClearAllModal;

  return (
    <div className={`min-h-screen transition-all duration-700 ${isAnyModalOpen ? 'overflow-hidden' : ''}`}>
      {/* Zen Top Bar */}
      <nav className="fixed top-0 w-full z-40 zen-glass border-none ring-1 ring-stone-100 dark:ring-stone-900 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 shadow-2xl">
            <Wind className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">ZenNote</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={toggleDarkMode} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="h-4 w-[1px] bg-stone-200 dark:bg-stone-800 hidden sm:block" />
          <button onClick={handleExportNotes} className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors uppercase tracking-widest">
            Export
          </button>
          <button onClick={() => setShowClearAllModal(true)} className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-red-500 transition-colors uppercase tracking-widest">
            Reset
          </button>
        </div>
      </nav>

      {/* Background Dimming Content */}
      <main className={`max-w-6xl mx-auto px-8 pt-32 pb-24 transition-all duration-500 ${isAnyModalOpen ? 'blur-md brightness-75 scale-[0.98]' : ''}`}>
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-light">{error}</p>
          </div>
        )}

        <ZenProgress totalNotes={notes.length} streak={streak} />
        <NoteForm onSubmit={handleAddNote} />
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredNotes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onEditClick={() => setNoteToEdit(note)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in text-stone-400">
            <Archive className="w-8 h-8 opacity-20 mb-6" />
            <h3 className="text-xl font-light">
              {notes.length === 0 ? "The space is ready for your thoughts." : "No thoughts match your current filter."}
            </h3>
          </div>
        )}
      </main>

      {/* Global Edit Modal */}
      {noteToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-stone-900/20 dark:bg-black/60 backdrop-blur-sm" onClick={() => setNoteToEdit(null)} />
          <div className="relative zen-glass rounded-[3rem] p-1 shadow-2xl w-full max-w-2xl ring-1 ring-stone-200 dark:ring-stone-800">
            <div className="bg-white dark:bg-stone-900 rounded-[2.9rem] p-10 overflow-hidden relative">
              <button 
                onClick={() => setNoteToEdit(null)}
                className="absolute top-8 right-8 p-2 text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-sm uppercase tracking-[0.3em] font-semibold text-stone-400 mb-10">Refining Note</h2>
              <NoteForm 
                onSubmit={(data) => handleUpdateNote(noteToEdit._id, data)}
                onCancel={() => setNoteToEdit(null)}
                initialData={noteToEdit}
                isEditing
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete/Clear Modals (Reused existing logic) */}
      {(showDeleteModal || showClearAllModal) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-stone-900/20 dark:bg-black/60 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setShowClearAllModal(false); }} />
          <div className="relative zen-glass rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl ring-1 ring-stone-200 dark:ring-stone-800">
             <h2 className="text-xl font-medium mb-2 text-stone-900 dark:text-stone-100 text-center">
              {showDeleteModal ? "Discard Thought?" : "Reset Stream?"}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm text-center mb-8 font-light">
              This action irreversible. Are you sure you want to proceed?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={showDeleteModal ? confirmDeleteNote : confirmClearAllNotes}
                className="zen-button zen-button-primary justify-center py-3 !bg-red-500 !text-white border-none"
              >
                Confirm
              </button>
              <button onClick={() => { setShowDeleteModal(false); setShowClearAllModal(false); }} className="zen-button zen-button-secondary justify-center py-3">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
