import { supabase } from '../supabaseClient';

export async function fetchEntries() {
  const { data, error } = await supabase
    .from('times')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching time entries:', error.message);
    return [];
  }

  return data || [];
}

export async function addEntry(entry) {
  const { data, error } = await supabase
    .from('times')
    .insert([entry]);

  if (error) {
    console.error('Error adding time entry:', error.message);
    return null;
  }

  return data?.[0] || null;
}