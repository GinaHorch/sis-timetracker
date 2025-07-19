import { supabase } from '../supabaseClient';

export type Client = {
  id: string;
  name: string;
  address: string;
  email?: string; // Optional field for email
  created_at: string; 
};

// Fetch all clients
export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error.message);
    return [];
  }

  return data as Client[];
}

// Add a new client
export async function addClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select(); // to return the new row

  if (error) {
    console.error('Error adding client:', error.message);
    return null;
  }
// Safely return the first item of the array, with correct type
  if (data && data.length > 0) {
    return data[0] as Client;
  }

  return null;
}

