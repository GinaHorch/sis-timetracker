import { supabase } from '../supabaseClient';

// Fetch all projects
export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error.message);
    return [];
  }

  return data || [];
}

// Add a new project
export async function addProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select();

  if (error) {
    console.error('Error adding project:', error.message);
    return null;
  }

  return data[0];
}
