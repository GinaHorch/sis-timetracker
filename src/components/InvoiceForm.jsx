import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { getProjects, getEntries, formatDate } from '../utils/storage';

export default function InvoiceForm() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);

  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hourlyRate, setHourlyRate] = useState(60);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  useEffect(() => {
    setProjects(getProjects());
    setEntries(getEntries());
  }, []);

  const selectedProject = projects.find(p => p.id === projectId);

  const filteredEntries = entries.filter(e =>
    e.projectId === projectId &&
    e.date >= startDate &&
    e.date <= endDate
  );

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalAmount = totalHours * hourlyRate;

  const generateInvoice = () => {
    const doc = new jsPDF();
    const today = new Date();
    const invoiceNumber = `INV-${projectId.slice(0, 5)}-${startDate.replaceAll('-', '')}`;

    doc.setFontSize(12);
    doc.text(`SERVICE INVOICE`, 20, 20);
    doc.text(`Invoice Number: ${invoiceNumber}`, 20, 30);
    doc.text(`Invoice Date: ${formatDate(today.toISOString())}`, 20, 36);

    // Your business details
    doc.text(`Social Insight Solutions`, 20, 48);
    doc.text(`ABN: 72 144 906 902`, 20, 54);
    doc.text(`PO Box 635`, 20, 60);
    doc.text(`Scarborough WA 6019`, 20, 66);
    doc.text(`Email: social.insight.solutions@gmail.com`, 20, 72);

    // Client
    doc.text(`Bill To:`, 120, 48);
    doc.text(clientName, 120, 54);
    doc.text(clientAddress, 120, 60);

    // Line items
    doc.text(`Description`, 20, 90);
    doc.text(`Total`, 160, 90);

    const yStart = 100;
    doc.text(`${selectedProject?.name || 'Project'} — ${filteredEntries.length} entries`, 20, yStart);
    doc.text(`${totalHours} hrs x $${hourlyRate}`, 20, yStart + 6);
    doc.text(`$${totalAmount.toFixed(2)}`, 160, yStart + 6);

    // Total
    doc.setFontSize(14);
    doc.text(`TOTAL $${totalAmount.toFixed(2)}`, 160, yStart + 20);

    // Footer: payment info
    doc.setFontSize(10);
    doc.text(`Payment Details:`, 20, 250);
    doc.text(`Regine Horch | BSB: 067-873 | Acc: 1214 0872`, 20, 256);

    doc.save(`${invoiceNumber}.pdf`);
  };

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold">Generate Invoice</h2>

      <select className="border p-2 w-full" value={projectId} onChange={e => setProjectId(e.target.value)} required>
        <option value="">Select Project</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div className="flex gap-4">
        <input className="border p-2 w-full" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        <input className="border p-2 w-full" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
      </div>

      <input className="border p-2 w-full" type="number" step="1" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="Hourly rate" required />
      <input className="border p-2 w-full" type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name" required />
      <textarea className="border p-2 w-full" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Client Address" rows={2} required />

      <div className="bg-gray-50 p-4 rounded border">
        <p><strong>Entries:</strong> {filteredEntries.length}</p>
        <p><strong>Total Hours:</strong> {totalHours}</p>
        <p><strong>Invoice Total:</strong> ${totalAmount.toFixed(2)}</p>
      </div>

      <button
        onClick={generateInvoice}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        disabled={!projectId || !startDate || !endDate || !clientName || !clientAddress}
      >
        Generate Invoice PDF
      </button>
    </div>
  );
}

