import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { formatDate } from '../utils/storage';
import { getNextInvoiceNumber } from '../utils/invoice';
import { fetchProjects } from '../services/projectService';
import { fetchClients } from '../services/clientService';
import { fetchEntries } from '../services/timeService';

export default function InvoiceForm() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [project_id, setProject_id] = useState('');

  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(today.getDate() - 13); // Includes today as one of 14 days
  const defaultStart = defaultStartDate.toISOString().slice(0, 10);
  const selectedProject = projects.find(p => p.id === project_id);
  const projectRate = selectedProject?.hourly_rate || 0;
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const client = clients.find(c => c.id === selectedProject?.client_id);
  const [includeDetails, setIncludeDetails] = useState(false);
  
  useEffect(() => {
  const loadData = async () => {
    const [projectData, entryData, clientData] = await Promise.all([
      fetchProjects(),
      fetchEntries(),
      fetchClients()
    ]);
    setProjects(projectData);
    setEntries(entryData);
    setClients(clientData);
  };
  loadData();
}, []);


  const filteredEntries = entries.filter((e) => {
  if (e.project_id !== project_id) return false;

  const entryDate = new Date(e.date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return entryDate >= start && entryDate <= end;
});

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalAmount = totalHours * projectRate;

  const generateInvoice = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const leftMargin = 20;
    let y = 20;

    const today = new Date();
    const invoiceNumber = getNextInvoiceNumber();

    // Add SIS logo
    doc.addImage(
        './SIS-logo-small.jpg', 
        'JPEG', 
        leftMargin, 
        y, 
        40, 
        30
    );

    // Invoice title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE INVOICE', pageWidth - leftMargin, y + 10, { align: 'right' });

    // Generate invoice number and today's date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${invoiceNumber}`, pageWidth - leftMargin, y + 18, { align: 'right' });
    doc.text(`Invoice Date: ${formatDate(today.toISOString())}`, pageWidth - leftMargin, y + 24, { align: 'right' });

    // Update y position for next section
    y += 40;

    // Set font for client and business section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', leftMargin, y);
    doc.text('Social Insight Solutions', pageWidth - leftMargin, y, { align: 'right' });

    // Client info (left side)
    doc.setFont('helvetica', 'normal');
    doc.text(client?.name || '—', leftMargin, y + 6);
    doc.text(client?.address || '—', leftMargin, y + 12);

    // Business info (right side)
    let businessInfo = [
        'ABN: 72 144 906 902',
        'PO Box 635',
        'Scarborough WA 6019',
        'Email: social.insight.solutions@gmail.com'
    ];
   
    businessInfo.forEach((line, i) => {
        doc.text(line, pageWidth - leftMargin, y + 6 + (i * 6), { align: 'right' });
    });
   
    // Update y position for next section
    y += 36;

    // Horizontal line above description
    doc.setDrawColor(150);
    doc.line(leftMargin, y, pageWidth - leftMargin, y);
    y += 6;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', leftMargin, y);
    doc.text('Total', pageWidth - leftMargin, y, { align: 'right' });
    y += 6;

    // Project summary
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${selectedProject?.name || 'Project'} — ${filteredEntries.length} entries`, leftMargin, y);
    doc.text(`${totalHours} hours x $${projectRate}/hr`, leftMargin, y + 6);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - leftMargin, y + 6, { align: 'right' });

    y += 8;

    // Horizontal line before TOTAL
    doc.setDrawColor(0);
    doc.line(leftMargin, y, pageWidth - leftMargin, y);
    y += 8;

    // TOTAL row
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', leftMargin, y);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - leftMargin, y, { align: 'right' });

    y += 18;

    if (includeDetails && filteredEntries.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.setFont('helvetica', 'bold');
    doc.text('Work Breakdown:', leftMargin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    filteredEntries.forEach(entry => {
        const desc = `${formatDate(entry.date)} — ${entry.notes || 'No notes'}`;
        const hrs = `${entry.hours} hrs`;
        
        // Draw line items
        doc.text(desc, leftMargin, y);
        doc.text(hrs, pageWidth - leftMargin, y, { align: 'right' });
        y += 6;
    });

    y += 6;
    }

    // Thank you message
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text('Thank you for the opportunity to work with you.', leftMargin, y);
    y += 8;

    // GST clarification
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('No GST has been charged. Social Insight Solutions is not currently registered for GST.', leftMargin, y);
    y += 18;

    // Payment heading
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', leftMargin, y);
    y += 6;

    // Payment details (normal font)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Account Name: Regine Horch', leftMargin, y);
    doc.text('Trading As: Social Insight Solutions', leftMargin, y + 6);
    doc.text('BSB: 067-873    Account: 1214 0872', leftMargin, y + 12);

    y += 24;  // Move down for footer

    // Acknowledgement text (wrap in multiple lines if needed)
    const ackText = `I am here on unceded Whadjuk Noongar and Mooro Noongar Country. I respectfully acknowledge the Whadjuk and Mooro people of the Noongar Nation as the Traditional Custodians of the lands where I live, work and learn. I honour their continuing connection to culture, country, waters, and skies and recognise the scientific contributions made by First Nations people. I pay my respects to their Elders past, present and emerging leaders.`;

    // Add it near the bottom of the page
    const splitAck = doc.splitTextToSize(ackText, pageWidth - 2 * leftMargin);
    doc.setFontSize(9);
    doc.setTextColor(100);
    splitAck.forEach((line, i) => {
        doc.text(line, pageWidth / 2, 270 + (i * 5), { align: 'center' });
    });

    doc.save(`${invoiceNumber}.pdf`);
    };

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold">Generate Invoice</h2>

      <select className="border p-2 w-full" value={project_id} onChange={e => setProject_id(e.target.value)} required>
        <option value="">Select Project</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div className="flex gap-4">
        <input className="border p-2 w-full" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        <input className="border p-2 w-full" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
      </div>

      <input className="border p-2 w-full" type="number" step="1" min="0" value={projectRate} onChange={e => setHourly_rate(e.target.value)} placeholder="Hourly rate" required />
      
      <div className="border p-2 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">Client</p>
        <p className="font-semibold">{client?.name || '—'}</p>
        <p>{client?.address || '—'}</p>
        </div>

      <label className="flex items-center space-x-2 text-sm">
        <input
            type="checkbox"
            checked={includeDetails}
            onChange={() => setIncludeDetails(!includeDetails)}
        />
        <span>Include entry breakdown on invoice PDF</span>
      </label>


      <div className="bg-gray-50 p-4 rounded border">
        <p><strong>Entries:</strong> {filteredEntries.length}</p>
        <p><strong>Total Hours:</strong> {totalHours}</p>
        <p><strong>Hourly Rate:</strong> ${projectRate}</p>
        <p><strong>Invoice Total:</strong> ${totalAmount.toFixed(2)}</p>

        {filteredEntries.length > 0 && (
            <div className="pt-2 border-t text-sm text-gray-700 space-y-1">
            <p className="font-semibold">Included Entries:</p>
            {filteredEntries.map((entry) => (
                <div key={entry.id} className="flex justify-between">
                <span>{formatDate(entry.date)} — {entry.notes || 'No notes'}</span>
                <span>{entry.hours} hrs</span>
                </div>
            ))}
            </div>
        )}
      </div>

      <button
        onClick={generateInvoice}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        disabled={!project_id || !startDate || !endDate || !client}
      >
        Generate Invoice PDF
      </button>
    </div>
  );
}

