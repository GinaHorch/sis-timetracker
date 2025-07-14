import { useState } from 'react';
import { getEntries, saveEntries } from '../utils/storage';

export default function TimeEntryForm({ projects, onAdd }) {
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      projectId,
      date,
      hours: parseFloat(hours),
      notes
    };
    const updated = [...getEntries(), newEntry];
    saveEntries(updated);
    onAdd(updated);

    // Reset form
    setProjectId('');
    setDate('');
    setHours('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <select className="border p-1 w-full" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
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
