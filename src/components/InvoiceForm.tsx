import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { formatDate } from '../utils/date';
import { reserveNextInvoiceNumber, incrementInvoiceCounter, saveInvoiceToSupabase } from '../services/invoiceService';
import { Project } from '../services/projectService';
import { Client } from '../services/clientService';
import { TimeEntry } from '../services/timeService';
import { toDataURL } from '@/utils/image';
import sisLogo from '/SIS-logo-small.jpg';
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';

interface InvoiceFormProps {
  projects: Project[];
  clients: Client[];
  entries: TimeEntry[];
}
export default function InvoiceForm({ projects, clients, entries }: InvoiceFormProps) {
  
  const [project_id, setProject_id] = useState<string>('');
  
  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(today.getDate() - 13); // Includes today as one of 14 days
  const defaultStart = defaultStartDate.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [includeDetails, setIncludeDetails] = useState<boolean>(false);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  
  const selectedProject = projects.find((p) => p.id === project_id);
  const client = clients.find((c) => c.id === selectedProject?.client_id);
    
  useEffect(() => {
  if (selectedProject?.hourly_rate) {
    setHourlyRate(selectedProject.hourly_rate);
    }
    }, [selectedProject]);

  const filteredEntries = entries.filter((e) => {
  if (e.project_id !== project_id) return false;

  const entryDate = new Date(e.date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return entryDate >= start && entryDate <= end;
  });

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalAmount = totalHours * hourlyRate;

  const generateInvoice = async () => {
    if (!project_id || !startDate || !endDate || !client) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Step 1: Reserve invoice number
      const result = await reserveNextInvoiceNumber();
      if (!result || result.invoiceNumber === 'SIS-ERROR') {
        toast.error('Failed to generate invoice number');
        return;
      }

      const { invoiceNumber, next } = result;

      // Step 2: Check for duplicate invoices
      const { data: existingInvoice, error: checkError } = await supabase
        .from('invoices')
        .select('id')
        .eq('project_id', project_id)
        .eq('start_date', startDate)
        .eq('end_date', endDate)
        .maybeSingle();

      if (checkError) {
        toast.error('Error checking for existing invoice');
        console.error(checkError.message);
        return;
      }

      if (existingInvoice) {
        toast.error('Invoice already exists for this project and period.');
        return;
      }

      // Step 3: Generate PDF as blob
      const pdfBlob = await generatePDFBlob(invoiceNumber);
      
      // Step 4: Save to Supabase (storage + database)
      const publicUrl = await saveInvoiceToSupabase({
        project_id: project_id,
        client_id: client.id,
        invoice_number: invoiceNumber,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount,
        total_hours: totalHours,
        pdfBlob: pdfBlob,
      });

      if (publicUrl) {
        // Step 5: Increment counter only after successful save
        const success = await incrementInvoiceCounter(next);
        if (!success) {
          toast.warning('Invoice saved, but counter not incremented!');
        }

        // Step 6: Show success with download link
        toast.success(
          <div>
            Invoice generated successfully!{' '}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary-600 hover:text-primary-700 ml-2"
            >
              Download PDF
            </a>
          </div>
        );
      } else {
        toast.error('Failed to save invoice');
      }

    } catch (error) {
      console.error('Invoice generation failed:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const generatePDFBlob = async (invoiceNumber: string): Promise<Blob> => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const leftMargin = 20;
    let y = 20;

    // Load SIS logo with proper error handling
    try {
      const imageData = await toDataURL(sisLogo);
      
      // Add SIS logo
      doc.addImage(
        imageData, 
        'JPEG', 
        leftMargin, 
        y, 
        40, 
        30
      );
    } catch (error) {
      console.warn('Could not load SIS logo:', error);
      // Continue without logo if it fails to load
    }

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
    doc.text(`${totalHours} hours x $${hourlyRate}/hr`, leftMargin, y + 6);
    doc.text(`Service Period: ${formatDate(startDate)} – ${formatDate(endDate)}`, leftMargin, y + 12);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - leftMargin, y + 6, { align: 'right' });

    y += 20;

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

    y += 24;

    // Acknowledgement text
    const ackText = `I am here on unceded Whadjuk Noongar and Mooro Noongar Country. I respectfully acknowledge the Whadjuk and Mooro people of the Noongar Nation as the Traditional Custodians of the lands where I live, work and learn. I honour their continuing connection to culture, country, waters, and skies and recognise the scientific contributions made by First Nations people. I pay my respects to their Elders past, present and emerging leaders.`;

    const splitAck: string[] = doc.splitTextToSize(ackText, pageWidth - 2 * leftMargin);
    doc.setFontSize(9);
    doc.setTextColor(100);
    splitAck.forEach((line, i) => {
      doc.text(line, pageWidth / 2, 270 + (i * 5), { align: 'center' });
    });

    // Return PDF as blob
    return doc.output('blob');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Project
        </label>
        <select 
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
          value={project_id} 
          onChange={e => setProject_id(e.target.value)} 
          required
        >
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Start Date
          </label>
          <input 
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            End Date
          </label>
          <input 
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            required 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Hourly Rate ($)
        </label>
        <input 
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" 
          type="number" 
          step="1" 
          min="0" 
          value={hourlyRate} 
          onChange={e => setHourlyRate(parseFloat(e.target.value))} 
          placeholder="Enter hourly rate" 
          required 
        />
      </div>
      
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <p className="text-sm font-medium text-neutral-700 mb-2">Client Information</p>
        <p className="font-semibold text-neutral-900">{client?.name || '—'}</p>
        <p className="text-neutral-600">{client?.address || '—'}</p>
      </div>

      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="includeDetails"
          checked={includeDetails}
          onChange={() => setIncludeDetails(!includeDetails)}
          className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
        />
        <label htmlFor="includeDetails" className="text-sm text-neutral-700">
          Include detailed entry breakdown on invoice PDF
        </label>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
        <h4 className="text-lg font-semibold text-neutral-900">Invoice Summary</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-neutral-600">Entries:</span>
            <span className="ml-2 font-medium text-neutral-900">{filteredEntries.length}</span>
          </div>
          <div>
            <span className="text-neutral-600">Total Hours:</span>
            <span className="ml-2 font-medium text-neutral-900">{totalHours}</span>
          </div>
          <div>
            <span className="text-neutral-600">Hourly Rate:</span>
            <span className="ml-2 font-medium text-neutral-900">${hourlyRate}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-primary-200">
            <span className="text-neutral-600">Invoice Total:</span>
            <span className="ml-2 text-lg font-bold text-primary-700">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {filteredEntries.length > 0 && (
          <div className="pt-4 border-t border-primary-200">
            <p className="text-sm font-medium text-neutral-700 mb-3">Included Entries:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="flex justify-between items-start text-xs bg-white rounded p-2 border border-primary-100">
                  <span className="text-neutral-700">{formatDate(entry.date)} — {entry.notes || 'No notes'}</span>
                  <span className="font-medium text-neutral-900 ml-2">{entry.hours} hrs</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={generateInvoice}
        disabled={!project_id || !startDate || !endDate || !client}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
      >
        Generate Invoice
      </button>
    </div>
  );
}

