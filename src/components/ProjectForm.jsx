import { useState } from 'react';
import { getProjects, saveProjects } from '../utils/storage';

export default function ProjectForm({ onAdd }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2024–25');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: Date.now().toString(),
      name,
      financialYear: year
    };
    const updated = [...getProjects(), newProject];
    saveProjects(updated);
    onAdd(updated);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="border p-1 w-full" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
      <select className="border p-1 w-full" value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="2024–25">2024–25</option>
        <option value="2025–26">2025–26</option>
      </select>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Project</button>
    </form>
  );
}
