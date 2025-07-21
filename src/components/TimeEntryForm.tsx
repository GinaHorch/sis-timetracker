import { useState, useEffect } from 'react';
import { addEntry, fetchEntries, updateEntry, TimeEntry } from '../services/timeService';
import { Project } from '../services/projectService';

interface TimeEntryFormProps {
  projects: Project[];
  onAdd: (entries: TimeEntry[]) => void;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => Promise<void>;
  editingEntry: TimeEntry | null;
  setEditingEntry: React.Dispatch<React.SetStateAction<TimeEntry | null>>;
  onCancel?: () => void;
}

export default function TimeEntryForm({ projects, onAdd, onEdit, onDelete, editingEntry, setEditingEntry, onCancel }: TimeEntryFormProps) {
  const [project_id, setProject_id] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setProject_id(editingEntry.project_id);
      setDate(editingEntry.date);
      setHours(String(editingEntry.hours));
      setNotes(editingEntry.notes || '');
    } else {
      setProject_id('');
      setDate('');
      setHours('');
      setNotes('');
    }
  }, [editingEntry]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
    console.log('Entry saved, refreshing...');
  const newEntry = {
    project_id,
    date,
    hours: parseFloat(hours),
    notes,
  };

  let saved;
    if (editingEntry) {
      saved = await updateEntry(editingEntry.id, newEntry);
    } else {
      saved = await addEntry(newEntry);
    }

  if (saved) {
    const updatedEntries = await fetchEntries();  // Refetch all entries
    onAdd(updatedEntries);                        // Update parent state
    setProject_id('');
    setDate('');
    setHours('');
    setNotes('');
    if (onCancel) onCancel(); // Clear editing state
  }
};

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        {editingEntry ? 'Edit Time Entry' : 'Add New Time Entry'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Project
          </label>
          <select 
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
            value={project_id} 
            onChange={(e) => setProject_id(e.target.value)} 
            required
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Date
            </label>
            <input 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Hours Worked
            </label>
            <input 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              type="number" 
              step="0.25" 
              min="0" 
              placeholder="e.g., 2.5" 
              value={hours} 
              onChange={(e) => setHours(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Notes
          </label>
          <textarea 
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none" 
            placeholder="Describe the work completed..." 
            rows={3}
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            {editingEntry ? 'Update Entry' : 'Add Entry'}
          </button>
          {editingEntry && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
