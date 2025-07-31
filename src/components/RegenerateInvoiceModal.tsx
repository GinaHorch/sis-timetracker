import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDate } from '../utils/date';
import { toDataURL } from '@/utils/image';
import jsPDF from 'jspdf';
import { supabase } from '../supabaseClient';
import sisLogo from '/SIS-logo-small.jpg';
import { TimeEntry, fetchEntries } from '../services/timeService';
import { Project } from '../services/projectService';
import { Client } from '../services/clientService';
import { saveInvoiceToSupabase, updateInvoiceInSupabase } from '../services/invoiceService';

interface Props {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  project_id: string;
  start_date: string;
  end_date: string;
  clients: Client[];
  projects: Project[];
  onSuccess?: () => void;
}

export default function RegenerateInvoiceModal({
  open,
  onClose,
  invoiceNumber,
  project_id,
  start_date,
  end_date,
  clients,
  projects,
  onSuccess,
}: Props) {
  const [includeDetails, setIncludeDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const regenerate = async () => {
    setLoading(true);
    try {
      const [entries] = await Promise.all([fetchEntries()]);
      const filteredEntries = entries.filter(e => {
        if (e.project_id !== project_id) return false;
        const entryDate = new Date(e.date);
        return entryDate >= new Date(start_date) && entryDate <= new Date(end_date);
      });

      const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
      const project = projects.find(p => p.id === project_id);
      const client = clients.find(c => c.id === project?.client_id);
      const hourlyRate = project?.hourly_rate || 0;
      const totalAmount = totalHours * hourlyRate;

      const pdfBlob = await generatePDFBlob({
        invoiceNumber,
        project,
        client,
        entries: filteredEntries,
        totalHours,
        totalAmount,
        includeDetails,
        start_date,
        end_date,
      });

      const url = await updateInvoiceInSupabase({
        invoice_number: invoiceNumber,
        project_id,
        client_id: client?.id || '',
        start_date,
        end_date,
        total_amount: totalAmount,
        total_hours: totalHours,
        pdfBlob,
      });

      if (url) {
        toast.success('Invoice PDF regenerated and overwritten.');
        onSuccess?.(); // Call the success callback to refresh the list
        onClose();
      } else {
        toast.error('Failed to save updated invoice PDF.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while regenerating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Regenerate Invoice</DialogTitle>
          <DialogDescription>
            This will regenerate and overwrite the PDF for invoice <strong>{invoiceNumber}</strong><br />
            Period: {formatDate(start_date)} – {formatDate(end_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox text-primary-600"
              checked={includeDetails}
              onChange={() => setIncludeDetails(!includeDetails)}
            />
            <span className="text-sm">Include detailed entry breakdown</span>
          </label>
        </div>

        <DialogFooter className="flex justify-end pt-6">
          <button
            className="px-4 py-2 rounded-md text-sm border border-neutral-300 hover:bg-neutral-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="ml-2 px-4 py-2 rounded-md text-sm bg-primary-600 text-white hover:bg-primary-700"
            onClick={regenerate}
            disabled={loading}
          >
            {loading ? 'Regenerating...' : 'Regenerate PDF'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function generatePDFBlob({
  invoiceNumber,
  project,
  client,
  entries,
  totalHours,
  totalAmount,
  includeDetails,
  start_date,
  end_date,
}: {
  invoiceNumber: string;
  project?: Project;
  client?: Client;
  entries: TimeEntry[];
  totalHours: number;
  totalAmount: number;
  includeDetails: boolean;
  start_date: string;
  end_date: string;
}): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 20;
  const bottomBuffer = 40;
  let y = 10;

  try {
    const imageData = await toDataURL(sisLogo);
    doc.addImage(imageData, 'JPEG', leftMargin, y, 50, 35);
  } catch (e) {}

  y += 40;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE INVOICE', pageWidth - leftMargin, y - 30, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Number: ${invoiceNumber}`, pageWidth - leftMargin, y - 22, { align: 'right' });
  doc.text(`Invoice Date: ${formatDate(new Date().toISOString())}`, pageWidth - leftMargin, y - 16, { align: 'right' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', leftMargin, y);
  doc.text('Social Insight Solutions', pageWidth - leftMargin, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(client?.name || '—', leftMargin, y + 6);
  doc.text(client?.address || '—', leftMargin, y + 12);

  const businessInfo = [
    'ABN: 72 144 906 902',
    'PO Box 635',
    'Scarborough WA 6019',
    'Email: social.insight.solutions@gmail.com'
  ];
  businessInfo.forEach((line, i) => {
    doc.text(line, pageWidth - leftMargin, y + 6 + i * 6, { align: 'right' });
  });

  y += 36;
  doc.setDrawColor(150);
  doc.line(leftMargin, y, pageWidth - leftMargin, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', leftMargin, y);
  doc.text('Total', pageWidth - leftMargin, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${project?.name || 'Project'} — ${entries.length} entries`, leftMargin, y);
  doc.text(`${totalHours} hours x $${project?.hourly_rate}/hr`, leftMargin, y + 6);
  doc.text(`Service Period: ${formatDate(start_date)} – ${formatDate(end_date)}`, leftMargin, y + 12);
  doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - leftMargin, y + 6, { align: 'right' });

  y += 20;
  doc.setDrawColor(0);
  doc.line(leftMargin, y, pageWidth - leftMargin, y);
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', leftMargin, y);
  doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - leftMargin, y, { align: 'right' });
  y += 18;

  if (includeDetails && entries.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.setFont('helvetica', 'bold');
    doc.text('Work Breakdown:', leftMargin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    for (const entry of entries) {
      const wrapped = doc.splitTextToSize(`${formatDate(entry.date)} — ${entry.notes || 'No notes'}`, pageWidth - 2 * leftMargin - 40);
      for (let i = 0; i < wrapped.length; i++) {
        if (y > pageHeight - bottomBuffer) {
          doc.addPage();
          y = 20;
          doc.setFont('helvetica', 'bold');
          doc.text('Continued Work Breakdown:', leftMargin, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
        }
        doc.text(wrapped[i], leftMargin, y);
        if (i === 0) {
          doc.text(`${entry.hours} hrs`, pageWidth - leftMargin, y, { align: 'right' });
        }
        y += 6;
      }
    }
    y += 6;
  }

  if (y > pageHeight - 60) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text('Thank you for the opportunity to work with you.', leftMargin, y);
  y += 8;
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
      doc.text(line, pageWidth / 2, 260 + (i * 5), { align: 'center' });    // I may decide later to use const ackY = pageHeight - 27 instead of hardcoding a position.
    });

    const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

  return doc.output('blob');
}
