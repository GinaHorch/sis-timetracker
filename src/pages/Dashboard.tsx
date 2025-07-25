import { useState, useEffect } from 'react';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import TimeEntryForm from '../components/TimeEntryForm';
import TimeSheetTable from '../components/TimeSheetTable';
import InvoiceForm from '../components/InvoiceForm';
import { fetchProjects, Project } from '../services/projectService';
import { fetchEntries, deleteEntry, TimeEntry } from '../services/timeService';
import { fetchClients, Client } from '../services/clientService';
import { saveAs } from 'file-saver';
import Header from '../components/Header';
import { Card, CardContent } from '@/components/ui/card';
import ProjectFormModal from '../components/ProjectFormModal';
import { toast } from 'sonner';
import { isInvoiceDay } from '../utils/invoiceReminder';
import InvoiceList from '../components/InvoiceList';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showReminder, setShowReminder] = useState(false);

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

  useEffect(() => {
    const checkInvoiceDue = () => {
      const projectsWithBilling = projects.filter(p => p.billing_start_date && p.billing_cycle);
      const today = new Date();

      for (const p of projectsWithBilling) {
        // Type guard: we know billing_start_date exists because of the filter above
        if (p.billing_start_date && p.billing_cycle) {
          const startDate = new Date(p.billing_start_date);
          const isDue = isInvoiceDay(startDate, p.billing_cycle, today);
          if (isDue) {
            setShowReminder(true);
            break; // one reminder is enough
          }
        }
      }
    };

    checkInvoiceDue();
  }, [projects]);

const filteredEntries = entries.filter(entry => {
    const project = projects.find(p => p.id === entry.project_id);
    return (
      (!filterProject || entry.project_id === filterProject) &&
      (!filterYear || project?.financial_year === filterYear)
    );
  });

  const handleDeleteEntry = async (id: string): Promise<void> => {
    await deleteEntry(id);
    const updated = await fetchEntries();
    setEntries(updated);
  };

  const handleEditEntry = (entry: TimeEntry): void => {
    setEditingEntry(entry);
  };
  const exportCSV = (): void => {
    const rows = filteredEntries.map(e => {
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      {showReminder && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">Invoice Due Reminder</p>
                <p className="text-sm text-amber-700 mt-1">It's time to generate invoices for your active projects!</p>
              </div>
            </div>
            <button
              onClick={() => setShowReminder(false)}
              className="flex-shrink-0 ml-4 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <Card className="border-none shadow-soft bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Add Project</h2>

              {!editingProject && (
            <ProjectForm
              onAdd={setProjects}
              onSave={() => {}} // not used in add mode
              clients={clients}
              setClients={setClients}
            />
          )}

            <ProjectList projects={projects} onEdit={setEditingProject} clients={clients}/>

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
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Time Entries</h2>
            <TimeEntryForm
              projects={projects}
              onAdd={(newEntries) => {
                setEntries(newEntries);
                console.log('Dashboard received new entries');
              }}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              onCancel={() => setEditingEntry(null)}
            />

            <div className="mt-6 flex gap-4 items-center flex-wrap">
              <select className="px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                      value={filterProject} 
                      onChange={(e) => setFilterProject(e.target.value)}>
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select className="px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                      value={filterYear} 
                      onChange={(e) => setFilterYear(e.target.value)}>
                <option value="">All Financial Years</option>
                {[...new Set(projects.map(p => p.financial_year))].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button onClick={exportCSV} 
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                Export CSV
              </button>
            </div>
        
            <div className="bg-white shadow-soft rounded-xl border border-neutral-200 p-6 mt-6">
              <TimeSheetTable 
                entries={filteredEntries} 
                projects={projects} 
                onEdit={handleEditEntry} 
                onDelete={handleDeleteEntry} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Generate Invoice</h2>
            <InvoiceForm projects={projects} clients={clients} entries={entries}/>
          </CardContent>
        </Card>
        <InvoiceList projects={projects} clients={clients} />
      </div>
    </div>
  );
}

export default Dashboard;
