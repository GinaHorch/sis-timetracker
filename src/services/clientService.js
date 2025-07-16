import { supabase } from '../supabaseClient';

// Fetch all clients
export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error.message);
    return [];
  }

  return data || [];
}

// Add a new client
export async function addClient({ name, address }) {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ name, address }])
    .select(); // to return the new row

  if (error) {
    console.error('Error adding client:', error.message);
    return null;
  }

  return data[0]; // return the inserted client
}
