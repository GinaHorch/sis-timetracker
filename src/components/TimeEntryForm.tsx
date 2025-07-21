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
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <select className="border p-1 w-full" value={project_id} onChange={(e) => setProject_id(e.target.value)} required>
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input className="border p-1 w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <input className="border p-1 w-full" type="number" step="0.25" min="0" placeholder="Hours worked" value={hours} onChange={(e) => setHours(e.target.value)} required />
      <textarea className="border p-1 w-full" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex gap-2">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editingEntry ? 'Update Entry' : 'Add Entry'}
        </button>
        {editingEntry && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
