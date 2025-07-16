import { useEffect, useState } from 'react';
import { fetchProjects, addProject } from '../services/projectService';
import { fetchClients } from '../services/clientService';
import ClientForm from './ClientForm';

export default function ProjectForm({ onAdd }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2024–25');
  const [hourly_rate, setHourly_rate] = useState('');
  const [clients, setClients] = useState([]);
  const [client_id, setClient_id] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);

  useEffect(() => {
  const loadClients = async () => {
    const data = await fetchClients();
    setClients(data);
  };
  loadClients();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const newProject = {
    name,
    financial_year: year,
    hourly_rate: parseFloat(hourly_rate),
    client_id: client_id,
  };

  const saved = await addProject(newProject);
  if (saved) {
    const updatedProjects = await fetchProjects();
    onAdd(updatedProjects);
    setName('');
    setHourly_rate('');
    setClient_id('');
  }
};

  return (
  <div className="space-y-4">
    {showClientForm ? (
      <ClientForm onUpdate={(updatedClients) => {
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