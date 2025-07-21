import { useEffect, useState } from 'react';
import { fetchProjects, addProject } from '../services/projectService';
import { fetchClients } from '../services/clientService';
import ClientForm from './ClientForm';
import { Client } from '../services/clientService';
import { Project } from '../services/projectService';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner"

interface ProjectFormProps {
  onAdd: (projects: Project[]) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

export default function ProjectForm({ onAdd, clients, setClients }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2025–26');
  const [hourly_rate, setHourly_rate] = useState('');
  const [client_id, setClient_id] = useState<string>('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [description, setDescription] = useState(''); // Optional description field
  const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
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
        toast.success('Project added successfully!');
      } else {
        toast.error('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('An error occurred while adding the project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isSaving && <Progress className="h-2 bg-primary-100" />}

      {showClientForm ? (
        <ClientForm onUpdate={(updatedClients: Client[]) => {
          setClients(updatedClients);
          setShowClientForm(false);
          setClient_id(updatedClients[updatedClients.length - 1].id); // Auto-select new client
        }} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Project Name
            </label>
            <input
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Financial Year
            </label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2024–25">2024–25</option>
              <option value="2025–26">2025–26</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Hourly Rate ($)
            </label>
            <input
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={hourly_rate}
              onChange={(e) => setHourly_rate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              rows={3}
              placeholder="Brief project description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Client
            </label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              value={client_id}
              onChange={(e) => setClient_id(e.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            
            <button
              type="button"
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              onClick={() => setShowClientForm(true)}
            >
              + Add New Client
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              {isSaving ? 'Adding Project...' : 'Add Project'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}