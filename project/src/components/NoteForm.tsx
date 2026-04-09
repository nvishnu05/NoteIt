import { useState, useEffect, useRef } from 'react';
import { Plus, Check, ArrowRight, Type, AlignLeft, Tag, Loader2 } from 'lucide-react';
import { NoteFormData } from '../types/Note';

interface NoteFormProps {
  onSubmit: (noteData: NoteFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: NoteFormData;
  isEditing?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    category: 'Personal'
  });
  const [isExpanded, setIsExpanded] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || 'Personal'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        if (!isEditing) {
          setFormData({ title: '', content: '', category: 'Personal' });
          setIsExpanded(false);
        }
      } catch (err) {
        console.error('NoteForm handleSubmit error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const categories = ['Personal', 'Work', 'Study', 'Ideas', 'Projects', 'Travel'];

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className={`transition-all duration-500 ease-out ${!isEditing ? (isExpanded ? 'zen-glass rounded-[2.5rem] p-10 ring-1 ring-stone-200 dark:ring-stone-800 mb-12' : 'bg-transparent mb-12') : ''}`}
    >
      {!isExpanded && !isEditing ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between p-6 zen-glass rounded-full border-none ring-1 ring-stone-100 dark:ring-stone-900 group hover:ring-stone-300 dark:hover:ring-stone-700 transition-all duration-300"
        >
          <span className="text-stone-400 font-light tracking-wide flex items-center gap-3">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Capture a new thought...
          </span>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-sans font-semibold text-stone-400 bg-stone-50 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">Ctrl + N</kbd>
          </div>
        </button>
      ) : (
        <div className="space-y-10 animate-fade-in text-stone-900 dark:text-stone-100">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between border-b border-stone-100 dark:border-stone-900/50 pb-8">
            <div className="flex items-center gap-4 w-full">
              <Type className="w-6 h-6 text-stone-300 shrink-0" />
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-3xl font-medium zen-input placeholder:text-stone-200 dark:placeholder:text-stone-800 focus:placeholder:text-stone-300"
                autoFocus
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/50 p-2 rounded-full ring-1 ring-stone-100 dark:ring-stone-800 shrink-0">
               <Tag className="w-4 h-4 text-stone-400 ml-2" />
               <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-transparent border-none text-[11px] uppercase tracking-widest font-bold text-stone-600 dark:text-stone-400 focus:ring-0 cursor-pointer pr-10"
                disabled={isSubmitting}
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-white dark:bg-stone-900">{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <AlignLeft className="w-6 h-6 text-stone-300 mt-1 shrink-0" />
            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-lg font-light leading-relaxed zen-input placeholder:text-stone-200 dark:placeholder:text-stone-800 min-h-[180px] resize-none"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="flex justify-between items-center pt-6">
            <p className="text-[11px] text-stone-400 uppercase tracking-widest font-medium">
              {isSubmitting ? 'Syncing...' : (isEditing ? 'Drafting changes' : 'New entry')}
            </p>
            <div className="flex gap-4">
              {(isEditing || isExpanded) && !isSubmitting && (
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing && onCancel) onCancel();
                    else setIsExpanded(false);
                  }}
                  className="zen-button zen-button-secondary py-3 px-8"
                >
                   {isEditing ? 'Cancel' : 'Discard'}
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`zen-button zen-button-primary py-3 px-10 shadow-2xl transition-all ${isSubmitting ? 'opacity-70 scale-95' : 'hover:scale-105'}`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <Check className="w-5 h-5" />
                        Save
                      </>
                    ) : (
                      <>
                        Store
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default NoteForm;