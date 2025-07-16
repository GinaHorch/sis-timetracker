import { useState } from 'react';
import { addEntry, fetchEntries } from '../services/timeService';

export default function TimeEntryForm({ projects, onAdd }) {
  const [project_id, setProject_id] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newEntry = {
    project_id,
    date,
    hours: parseFloat(hours),
    notes
  };

  const saved = await addEntry(newEntry);
  if (saved) {
    const updated = await fetchEntries();
    onAdd(updated);
    // Reset form
    setProject_id('');
    setDate('');
    setHours('');
    setNotes('');
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
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Entry</button>
    </form>
  );
}
