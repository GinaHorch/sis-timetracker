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
      <DialogContent className="max-w-2xl bg-white border border-neutral-200 shadow-lg rounded-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            Generate Invoice
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            Fill in the details below to generate and save an invoice
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <InvoiceForm projects={projects} clients={clients} entries={entries} />
        </div>

        <DialogFooter className="flex justify-end pt-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 rounded-md transition-colors duration-200"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}