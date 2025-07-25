import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Project } from '../services/projectService';
import { Client } from '../services/clientService';
import { formatDate } from '../utils/date';
import { Card } from "@/components/ui/card";

interface Invoice {
  id: string;
  project_id: string;
  client_id: string;
  invoice_number: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  total_hours: number;
  pdf_url: string;
}

interface Props {
  projects: Project[];
  clients: Client[];
}

export default function InvoiceList({ projects, clients }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Failed to fetch invoices:', error.message);
      } else {
        setInvoices(data || []);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const project = projects.find((p) => p.id === inv.project_id);
    return (
      (!filterProject || inv.project_id === filterProject) &&
      (!filterYear || project?.financial_year === filterYear)
    );
  });

  return (
    <Card className="bg-white border border-neutral-200 shadow-soft p-6 mt-8">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Past Invoices</h2>

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="px-3 py-2 border rounded-lg text-sm"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded-lg text-sm"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {[...new Set(projects.map((p) => p.financial_year))].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-4 py-2 border-b">Invoice #</th>
              <th className="px-4 py-2 border-b">Project</th>
              <th className="px-4 py-2 border-b">Client</th>
              <th className="px-4 py-2 border-b">Date Range</th>
              <th className="px-4 py-2 border-b">Hours</th>
              <th className="px-4 py-2 border-b">Amount</th>
              <th className="px-4 py-2 border-b">PDF</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              const project = projects.find((p) => p.id === inv.project_id);
              const client = clients.find((c) => c.id === inv.client_id);

              return (
                <tr key={inv.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 border-b">{inv.invoice_number}</td>
                  <td className="px-4 py-2 border-b">{project?.name || '—'}</td>
                  <td className="px-4 py-2 border-b">{client?.name || '—'}</td>
                  <td className="px-4 py-2 border-b">
                    {formatDate(inv.start_date)} – {formatDate(inv.end_date)}
                  </td>
                  <td className="px-4 py-2 border-b">{inv.total_hours}</td>
                  <td className="px-4 py-2 border-b">${inv.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b">
                    <a
                      href={inv.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-neutral-500 py-4">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}