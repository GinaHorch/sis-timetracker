import { supabase } from '../supabaseClient';

export interface Project {
  id: string;
  name: string;
  financial_year: string; 
  hourly_rate: number; // Optional hourly rate field
  client_id: string; // Foreign key to the client
  created_at: string;
  description?: string; // Optional description field
}

// Fetch all projects
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error.message);
    return [];
  }

  return data as Project[];
}

// Add a new project
export async function addProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select();

  if (error || !data || data.length === 0) {
    console.error('Error adding project:', error?.message);
    return null;
  }

  return data[0] as Project;
}

export async function updateProject(project: Project): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', project.id)
    .select();

  if (error || !data || data.length === 0) {
    console.error('Error updating project:', error?.message);
    return null;
  }

  return data[0] as Project;
}