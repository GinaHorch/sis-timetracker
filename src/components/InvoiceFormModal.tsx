import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Client } from '../services/clientService';
import { Project } from '../services/projectService';
import { TimeEntry } from '../services/timeService';
import InvoiceForm from './InvoiceForm';

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  clients: Client[];
  entries: TimeEntry[];
}

export default function InvoiceFormModal({
  open,
  onClose,
  projects,
  clients,
  entries,
}: InvoiceFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border border-neutral-300 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            Generate Invoice
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            Fill in the details below to generate and save an invoice
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          <InvoiceForm projects={projects} clients={clients} entries={entries} />
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}