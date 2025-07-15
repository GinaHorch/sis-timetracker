import React, { useState, useEffect } from 'react';
import { getProjects } from '../utils/storage';
import { getClients } from '../utils/clients';

export default function ProjectList({ projects }) {
    const getClientName = (id) => getClients().find(c => c.id === id)?.name || 'No client';

  return (
    <ul className="mt-4 space-y-1">
      {projects.map((p) => (
        <li key={p.id} className="border p-2 rounded">
          <strong>{p.name}</strong> — {p.financialYear}
          <br />
          <small>Client: {getClientName(p.clientId)}</small>
        </li>
      ))}
    </ul>
  );
}

