import { useState, useEffect } from 'react';
import { fetchClients, Client } from '../services/clientService';
import { Project } from '../services/projectService';

interface ProjectListProps {
  projects: Project[]
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      const data: Client[] = await fetchClients();
      setClients(data);
    };
    loadClients();
  }, []);

  const getClientName = (id: string): string => 
    clients.find((c) => c.id === id)?.name || 'No client';

  return (
    <ul className="mt-4 space-y-1">
      {projects.map((p) => (
        <li key={p.id} className="border p-2 rounded">
          <strong>{p.name}</strong> — {p.financial_year}
          <br />
          <small>Client: {getClientName(p.client_id)}</small>
        </li>
      ))}
    </ul>
  );
}

