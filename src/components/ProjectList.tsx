import { useState, useEffect } from 'react';
import { fetchClients, Client } from '../services/clientService';
import { Project } from '../services/projectService';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  clients: Client[];
  onToggleActive: (projectId: string, newValue: boolean) => void;
}

export default function ProjectList({ projects, onEdit, clients, onToggleActive }: ProjectListProps) {
  
  const getClientName = (id: string): string => 
    clients.find((c) => c.id === id)?.name || 'No client';

  return (
    <div className="mt-6">
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-neutral-500 text-sm">No projects found</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-neutral-300">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-neutral-900 leading-tight">{p.name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-200">
                  {p.financial_year}
                </span>
              </div>
              
              {/* Project Description */}
              {p.description && (
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{p.description}</p>
              )}
              
              <div className="flex items-center text-sm text-neutral-600 mb-4">
                <svg className="w-4 h-4 mr-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-neutral-500">Client:</span>
                <span className="font-medium text-neutral-700 ml-1">{getClientName(p.client_id)}</span>
              </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                {/* Custom Toggle Switch */}
                <button
                  onClick={() => onToggleActive(p.id, !(p.is_active ?? true))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    p.is_active ?? true
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-neutral-200 hover:bg-neutral-300'
                  }`}
                  aria-label={`Toggle ${p.name} active status`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                      p.is_active ?? true ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                {/* Status Text with Visual Indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    p.is_active ?? true ? 'bg-green-400' : 'bg-neutral-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    p.is_active ?? true ? 'text-green-700' : 'text-neutral-500'
                  }`}>
                    {(p.is_active ?? true) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <button 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 hover:border-primary-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => onEdit(p)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Project
              </button>
            </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

