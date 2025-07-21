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
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 shadow-soft">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Add New Client</h3>
        <p className="text-sm text-neutral-600 mt-1">Enter the client details below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Client Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Enter client name"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter client address"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="client@example.com"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Add Client
          </button>
        </div>
      </form>
    </div>
  );
}
