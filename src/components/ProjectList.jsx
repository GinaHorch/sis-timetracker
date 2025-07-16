import React, { useState, useEffect } from 'react';
import { fetchClients } from '../services/clientService';

export default function ProjectList({ projects }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const loadClients = async () => {
      const data = await fetchClients();
      setClients(data);
    };
    loadClients();
  }, []);

  const getClientName = (id) => clients.find(c => c.id === id)?.name || 'No client';

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

