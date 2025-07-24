import { useEffect, useState } from 'react';
import { updateProject } from '../services/projectService';
import { Client } from '../services/clientService';
import { Project } from '../services/projectService';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  clients: Client[];
  onSave: () => void;
}

export default function ProjectFormModal({ open, onClose, project, clients, onSave }: ProjectFormModalProps) {
    if (!project) return null;
  const [name, setName] = useState(project.name);
  const [year, setYear] = useState(project.financial_year);
  const [hourly_rate, setHourly_rate] = useState(String(project.hourly_rate));
  const [client_id, setClient_id] = useState(project.client_id);
  const [description, setDescription] = useState(project.description || '');
  const [billing_start_date, setBilling_start_date] = useState(project.billing_start_date || '');
  const [billing_cycle, setBilling_cycle] = useState(project.billing_cycle || 'fortnightly');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(project.name);
    setYear(project.financial_year);
    setHourly_rate(String(project.hourly_rate));
    setClient_id(project.client_id);
    setDescription(project.description || '');
    setBilling_start_date(project.billing_start_date || '');
    setBilling_cycle(project.billing_cycle || 'fortnightly');
  }, [project]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      id: project.id,
      name,
      financial_year: year,
      hourly_rate: parseFloat(hourly_rate),
      client_id,
      description: description || '', // Optional field
      billing_start_date: billing_start_date || undefined,
      billing_cycle: billing_cycle || 'fortnightly',
      created_at: project.created_at, // Keep original created_at
    };

    try {
      const updated = await updateProject(payload);
      if (updated) {
        toast.success('Project updated!');
        onSave();
        onClose();
      } else {
        toast.error('Failed to update project');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-neutral-300 shadow-2xl max-w-lg w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-neutral-900">Edit Project</DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">Update project details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSaving && <Progress className="h-2 bg-primary-100" />}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Project Name</label>
            <input 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Financial Year</label>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">Hourly Rate</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              value={hourly_rate} 
              onChange={(e) => setHourly_rate(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Billing Start Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              value={billing_start_date} 
              onChange={(e) => setBilling_start_date(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Billing Cycle</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              value={billing_cycle} 
              onChange={(e) => setBilling_cycle(e.target.value)}
            >
              <option value="fortnightly">Fortnightly</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none" 
              rows={3}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Client</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
              value={client_id} 
              onChange={(e) => setClient_id(e.target.value)}
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <DialogFooter className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Update Project'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
