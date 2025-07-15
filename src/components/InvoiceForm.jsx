import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { getProjects, getEntries, formatDate } from '../utils/storage';
import { getNextInvoiceNumber } from '../utils/invoice';

export default function InvoiceForm() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);

  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
 
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  useEffect(() => {
    setProjects(getProjects());
    setEntries(getEntries());
  }, []);

  const selectedProject = projects.find(p => p.id === projectId);
  const projectRate = selectedProject?.hourlyRate || 0;

  const filteredEntries = entries.filter(e =>
    e.projectId === projectId &&
    e.date >= startDate &&
    e.date <= endDate
  );

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
    doc.text(clientName, leftMargin, y + 6);
    doc.text(clientAddress, leftMargin, y + 12);

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

    y += 18;

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

    // Thank you message
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text('Thank you for the opportunity to work with you.', leftMargin, y);
    y += 6;

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

      <input className="border p-2 w-full" type="number" step="1" min="0" value={projectRate} onChange={e => setHourlyRate(e.target.value)} placeholder="Hourly rate" required />
      <input className="border p-2 w-full" type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name" required />
      <textarea className="border p-2 w-full" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Client Address" rows={2} required />

      <div className="bg-gray-50 p-4 rounded border">
        <p><strong>Entries:</strong> {filteredEntries.length}</p>
        <p><strong>Total Hours:</strong> {totalHours}</p>
        <p><strong>Hourly Rate:</strong> ${projectRate}</p>
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

