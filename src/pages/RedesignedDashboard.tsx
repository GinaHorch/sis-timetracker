import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { fetchProjects, Project } from '../services/projectService';
import { fetchEntries, deleteEntry, TimeEntry } from '../services/timeService';
import { fetchClients, Client } from '../services/clientService';
import Header from '../components/Header';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import ProjectFormModal from '../components/ProjectFormModal';
import TimeEntryForm from '../components/TimeEntryForm';
import TimeSheetTable from '../components/TimeSheetTable';
import InvoiceList from '../components/InvoiceList';
import InvoiceFormModal from '../components/InvoiceFormModal';
import { toast } from 'sonner';
import { isInvoiceDay } from '../utils/invoiceReminder';
import { saveAs } from 'file-saver';
import { supabase } from '../supabaseClient';
import { getNextInvoiceDue } from '@/utils/invoiceUtils';

interface InvoiceMeta {
  project_id: string;
  start_date: string;
  end_date: string;
}

type TaggedEntry = TimeEntry & { invoiced: boolean };

export default function RedesignedDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [showReminder, setShowReminder] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [filterProject, setFilterProject] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [invoices, setInvoices] = useState<InvoiceMeta[]>([]);
    const [showAllEntries, setShowAllEntries] = useState(false);
    const [dismissMissingBilling, setDismissMissingBilling] = useState(false);

    const taggedEntries: TaggedEntry[] = entries.map(entry => {
    const projectInvoices = invoices.filter(i => i.project_id === entry.project_id);
    const entryDate = new Date(entry.date);
    const isInvoiced = projectInvoices.some(inv => {
      const start = new Date(inv.start_date);
      const end = new Date(inv.end_date);
      return entryDate >= start && entryDate <= end;
    });
    return { ...entry, invoiced: isInvoiced };
  });

  const projectsWithBilling = projects.filter(p => p.billing_start_date && p.billing_cycle);
  const nextInvoice = projectsWithBilling.length > 0 ? getNextInvoiceDue(projects) : null;
  const hasMissingBilling = !dismissMissingBilling && projects.some(p => {
    const hasEntries = entries.some(e => e.project_id === p.id);
    return hasEntries && (!p.billing_start_date || !p.billing_cycle);
  });

  useEffect(() => {
    const loadData = async () => {
      const [p, e, c] = await Promise.all([
        fetchProjects(),
        fetchEntries(),
        fetchClients(),
      ]);
      setProjects(p);
      setEntries(e);
      setClients(c);
    };
    loadData();
  }, []);

  useEffect(() => {
    const today = new Date();
    for (const p of projectsWithBilling) {
      if (isInvoiceDay(new Date(p.billing_start_date!), p.billing_cycle!, today)) {
        setShowReminder(true);
        break;
      }
    }
  }, [projects]);

  useEffect(() => {
  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('project_id, start_date, end_date');

    if (!error && data) {
      setInvoices(data);
    }
  };

  fetchInvoices();
}, []);

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
    const updated = await fetchEntries();
    setEntries(updated);
  };

  const handleEditEntry = (entry: TimeEntry) => setEditingEntry(entry);

  const handleToggleActive = async (projectId: string, newValue: boolean) => {
  const { error } = await supabase
    .from('projects')
    .update({ is_active: newValue })
    .eq('id', projectId);

  if (!error) {
    const updated = await fetchProjects();
    setProjects(updated);
    toast.success(`Project marked as ${newValue ? 'active' : 'inactive'}.`);
  } else {
    toast.error('Failed to update project status.');
  }
};

  const exportCSV = (): void => {
    const filtered = entries.filter(entry => {
      const project = projects.find(p => p.id === entry.project_id);
      return (
        (!filterProject || entry.project_id === filterProject) &&
        (!filterYear || project?.financial_year === filterYear)
      );
    });

  const rows = filtered.map(e => {
        const project = projects.find(p => p.id === e.project_id);
        return {
            Date: e.date,
            Project: project?.name || '',
            FinancialYear: project?.financial_year || '',
            Hours: e.hours,
            Notes: e.notes
        };
    });

  const header = Object.keys(rows[0]).join(',');
        const body = rows.map(row => Object.values(row).join(',')).join('\n');
        const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'sis-timesheet.csv');
    };

  const filteredEntries = taggedEntries.filter(entry => {
        const project = projects.find(p => p.id === entry.project_id);
        return (
        (!filterProject || entry.project_id === filterProject) &&
        (!filterYear || project?.financial_year === filterYear) &&
        (showAllEntries || !entry.invoiced) // Show all or only uninvoiced entries
        );
    });

  const activeProjects = projects.filter(p => p.is_active !== false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      {showReminder && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex justify-between">
            <p className="text-sm text-amber-700">It's time to generate invoices!</p>
            <button onClick={() => setShowReminder(false)} className="text-sm text-amber-600">Dismiss</button>
          </div>
        </div>
      )}

      {hasMissingBilling && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-lg p-4 mb-6 flex justify-between">
            <p className="text-sm">Some projects have time entries but are missing billing details. Add a billing start date and cycle to enable invoice tracking.</p>
            <button
              className="text-sm text-amber-700 hover:underline"
              onClick={() => setDismissMissingBilling(true)}
            >Dismiss</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-neutral-600">Active Projects</p>
              <p className="text-2xl font-semibold text-primary-700">{activeProjects.length}</p>
            </CardContent>
          </Card>
          
          <Card className="border border-neutral-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Entries This Month</span>
                <span className="text-2xl font-bold text-primary-700">
                  {entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-neutral-200 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm font-medium text-neutral-600">Next Invoice Due</span>
                </div>
                {nextInvoice ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-neutral-900 text-sm">{nextInvoice.projectName}</p>
                    <p className="text-xs text-neutral-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      Due: {nextInvoice.dueDate.toLocaleDateString('en-AU')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <p className="text-sm text-green-700 font-medium">All invoices up to date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="time">
          <TabsList>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="pt-6">
            <Card><CardContent className="p-6 space-y-6">
                <TimeEntryForm
                projects={projects}
                onAdd={setEntries}
                editingEntry={editingEntry}
                setEditingEntry={setEditingEntry}
                onDelete={handleDeleteEntry}
              />

                <div className="flex gap-4 items-center flex-wrap">
                <select
                  className="px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700"
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">All Financial Years</option>
                  {[...new Set(projects.map(p => p.financial_year))].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <button
                  onClick={exportCSV}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Export CSV
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={showAllEntries}
                    onChange={() => setShowAllEntries(!showAllEntries)}
                    className="form-checkbox h-4 w-4 text-primary-600"
                />
                Show all entries (including invoiced)
                </label>

              <div className="mt-6">
                <TimeSheetTable
                  entries={filteredEntries}
                  projects={projects}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="projects" className="pt-6">
            <Card><CardContent className="p-6">
              <ProjectForm
                clients={clients}
                setClients={setClients}
                onAdd={setProjects}
                onSave={() => {}}
              />
              <ProjectList
                projects={projects}
                onEdit={setEditingProject}
                clients={clients}
                onToggleActive={handleToggleActive}
              />
              <ProjectFormModal
                open={!!editingProject}
                onClose={() => setEditingProject(null)}
                project={editingProject}
                clients={clients}
                onSave={async () => {
                  const updated = await fetchProjects();
                  setProjects(updated);
                  setEditingProject(null);
                }}
              />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="invoices" className="pt-6">
            <Card><CardContent className="p-6 space-y-6">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Generate Invoice
              </button>
              <InvoiceList projects={projects} clients={clients} />
              <InvoiceFormModal
                open={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                projects={projects}
                clients={clients}
                entries={entries}
              />
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
