import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Project } from '../services/projectService';
import { Client } from '../services/clientService';
import { formatDate } from '../utils/date';
import { Card } from "@/components/ui/card";
import RegenerateInvoiceModal from './RegenerateInvoiceModal';

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
  const [regeneratingInvoice, setRegeneratingInvoice] = useState<Invoice | null>(null);

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

  useEffect(() => {
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
    <Card className="bg-white border border-neutral-200 shadow-sm rounded-lg p-6 mt-8">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Past Invoices</h2>

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
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
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
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
        <table className="min-w-full text-sm border border-neutral-200 rounded-lg overflow-hidden">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Invoice #</th>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Project</th>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Client</th>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Date Range</th>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Hours</th>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Amount</th>
              <th className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredInvoices.map((inv) => {
              const project = projects.find((p) => p.id === inv.project_id);
              const client = clients.find((c) => c.id === inv.client_id);

              return (
                <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 border-b border-neutral-200">{inv.invoice_number}</td>
                  <td className="px-4 py-3 border-b border-neutral-200">{project?.name || '—'}</td>
                  <td className="px-4 py-3 border-b border-neutral-200">{client?.name || '—'}</td>
                  <td className="px-4 py-3 border-b border-neutral-200">
                    {formatDate(inv.start_date)} – {formatDate(inv.end_date)}
                  </td>
                  <td className="px-4 py-3 border-b border-neutral-200">{inv.total_hours}</td>
                  <td className="px-4 py-3 border-b border-neutral-200">${inv.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-3 border-b border-neutral-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline text-sm"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => setRegeneratingInvoice(inv)}
                        className="text-xs text-primary-500 hover:text-primary-700 underline text-left"
                      >
                        Regenerate PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-neutral-500 py-8">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {regeneratingInvoice && (
          <RegenerateInvoiceModal
            open={!!regeneratingInvoice}
            onClose={() => setRegeneratingInvoice(null)}
            invoiceNumber={regeneratingInvoice.invoice_number}
            project_id={regeneratingInvoice.project_id}
            start_date={regeneratingInvoice.start_date}
            end_date={regeneratingInvoice.end_date}
            clients={clients}
            projects={projects}
            onSuccess={() => {
              fetchInvoices(); // Refresh the invoice list
              setRegeneratingInvoice(null);
            }}
          />
        )}
      </div>
    </Card>
  );
}