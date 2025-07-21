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
    <div className="mt-6">
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-neutral-500 text-sm">No projects found</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-neutral-900">{p.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {p.financial_year}
                </span>
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <svg className="w-4 h-4 mr-1.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Client: <span className="font-medium text-neutral-700 ml-1">{getClientName(p.client_id)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

