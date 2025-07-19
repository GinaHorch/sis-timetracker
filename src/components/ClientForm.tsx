import { useState } from 'react';
import { fetchClients, addClient } from '../services/clientService';
import { Client } from '../services/clientService';

type ClientFormProps = {
  onUpdate: (clients: Client[]) => void;
};

export default function ClientForm({ onUpdate }: ClientFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState(''); // Optional email field

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const newClient = await addClient({ name, address, email });
  if (newClient) {
    const updated = await fetchClients();
    onUpdate(updated);
    setName('');
    setAddress('');
    setEmail(''); // Reset email field if needed
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Client
      </button>
    </form>
  );
}
