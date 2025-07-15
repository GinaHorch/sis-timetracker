import { useEffect, useState } from 'react';
import { getProjects, saveProjects } from '../utils/storage';
import { getClients } from '../utils/clients';

export default function ProjectForm({ onAdd }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2024–25');
  const [hourlyRate, setHourlyRate] = useState('');
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    setClients(getClients());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: Date.now().toString(),
      clientId,
      name,
      financialYear: year,
      hourlyRate: parseFloat(hourlyRate)
    };
    const updated = [...getProjects(), newProject];
    saveProjects(updated);
    onAdd(updated);
    setName('');
    setHourlyRate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <select
        className="border p-1 w-full"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        required
        >
        <option value="">Select Client</option>
        {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
        ))}
      </select>  
      <input className="border p-1 w-full" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
      <select className="border p-1 w-full" value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="2024–25">2024–25</option>
        <option value="2025–26">2025–26</option>
      </select>
      <input className="border p-1 w-full" type="number" step="0.01" min="0" placeholder="Hourly rate" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Project</button>
    </form>
  );
}
