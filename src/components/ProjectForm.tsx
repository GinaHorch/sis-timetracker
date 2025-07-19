import { useEffect, useState } from 'react';
import { fetchProjects, addProject } from '../services/projectService';
import { fetchClients } from '../services/clientService';
import ClientForm from './ClientForm';
import { Client } from '../services/clientService';
import { Project } from '../services/projectService';

export default function ProjectForm({ onAdd }: { onAdd: (projects: Project[]) => void }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2025–26');
  const [hourly_rate, setHourly_rate] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [client_id, setClient_id] = useState<string>('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [description, setDescription] = useState(''); // Optional description field

  useEffect(() => {
  const loadClients = async () => {
    const data: Client[] = await fetchClients();
    setClients(data);
  };
  loadClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const newProject = {
    name,
    financial_year: year,
    hourly_rate: parseFloat(hourly_rate),
    client_id: client_id,
    created_at: new Date().toISOString(),
    description: '', // Optional field, can be set later
  };

  const saved = await addProject(newProject);
  if (saved) {
    const updatedProjects = await fetchProjects();
    onAdd(updatedProjects);
    setName('');
    setHourly_rate('');
    setClient_id('');
    setDescription(''); // Reset description field
  }
};

  return (
  <div className="space-y-4">
    {showClientForm ? (
      <ClientForm onUpdate={(updatedClients: Client[]) => {
        setClients(updatedClients);
        setShowClientForm(false);
        setClient_id(updatedClients[updatedClients.length - 1].id); // Auto-select new client
      }} />
    ) : (
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          className="border p-1 w-full"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="border p-1 w-full"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="2024–25">2024–25</option>
          <option value="2025–26">2025–26</option>
        </select>
        <input
          className="border p-1 w-full"
          type="number"
          step="0.01"
          min="0"
          placeholder="Hourly rate"
          value={hourly_rate}
          onChange={(e) => setHourly_rate(e.target.value)}
          required
        />
        <textarea
          className="border p-1 w-full"
          placeholder="Description (optional)"
          value={description} // Placeholder for description, can be set later
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Client selection dropdown */}
        <select
          className="border p-1 w-full"
          value={client_id}
          onChange={(e) => setClient_id(e.target.value)}
          required
        >
          <option value="">Select Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>

        <button
          type="button"
          className="text-sm text-blue-600 underline"
          onClick={() => setShowClientForm(true)}
        >
          Add New Client
        </button>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Project
        </button>
      </form>
    )}
  </div>
);
}