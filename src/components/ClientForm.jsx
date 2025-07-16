import { useState } from 'react';
import { fetchClients, addClient } from '../services/clientService';

export default function ClientForm({ onUpdate }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newClient = await addClient({ name, address });
  if (newClient) {
    const updated = await fetchClients();
    onUpdate(updated);
    setName('');
    setAddress('');
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-semibold">Add New Client</h3>
      <input
        className="border p-1 w-full"
        placeholder="Client name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        className="border p-1 w-full"
        placeholder="Client address"
        rows={2}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Save Client
      </button>
    </form>
  );
}