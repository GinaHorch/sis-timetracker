import { supabase } from '../supabaseClient';

export interface TimeEntry {
  id: string;
  project_id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  notes: string;
  created_at: string;
}

export async function fetchEntries(): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('times')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching time entries:', error.message);
    return [];
  }

  return (data as TimeEntry[]) || [];
}

export async function addEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('times')
    .insert([entry])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding time entry:', error?.message ?? 'No data returned');
    return null;
  }

  return data as TimeEntry;
}

export async function updateEntry(id: string, updatedEntry: Partial<TimeEntry>): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('times')
    .update(updatedEntry)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating time entry:', error.message);
    return null;
  }
  
  return data as TimeEntry | null;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('times')
    .delete()
    .eq('id', id);

  if (error) console.error('Delete error:', error.message);
}