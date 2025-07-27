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
import InvoiceFormModal from '../components/InvoiceFormModal'; // <- To be created
import { toast } from 'sonner';
import { isInvoiceDay } from '../utils/invoiceReminder';

export default function RedesignedDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
    const projectsWithBilling = projects.filter(p => p.billing_start_date && p.billing_cycle);
    const today = new Date();
    for (const p of projectsWithBilling) {
      if (isInvoiceDay(new Date(p.billing_start_date!), p.billing_cycle!, today)) {
        setShowReminder(true);
        break;
      }
    }
  }, [projects]);

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
    const updated = await fetchEntries();
    setEntries(updated);
  };

  const handleEditEntry = (entry: TimeEntry) => setEditingEntry(entry);

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

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-4">Total Projects: {projects.length}</CardContent></Card>
          <Card><CardContent className="p-4">Entries This Month: {entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}</CardContent></Card>
          <Card><CardContent className="p-4">Uninvoiced Projects: {projects.filter(p => p.billing_start_date).length}</CardContent></Card>
        </div>

        <Tabs defaultValue="time">
          <TabsList>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="pt-6">
            <Card><CardContent className="p-6">
              <TimeEntryForm
                projects={projects}
                onAdd={setEntries}
                editingEntry={editingEntry}
                setEditingEntry={setEditingEntry}
                onDelete={handleDeleteEntry}
              />

              <div className="mt-6">
                <TimeSheetTable
                  entries={entries}
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
