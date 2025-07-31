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
import RevenueChart from '../components/RevenueChart';

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
    const projectsWithBilling = projects.filter(
    p => p.is_active && p.billing_start_date && p.billing_cycle
  );
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex justify-between">
            <p className="text-sm text-amber-700">It's time to generate invoices!</p>
            <button onClick={() => setShowReminder(false)} className="text-sm text-amber-600">Dismiss</button>
          </div>
        </div>
      )}

      {hasMissingBilling && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-lg p-4 mb-6 flex justify-between">
            <p className="text-sm">Some projects have time entries but are missing billing details. Add a billing start date and cycle to enable invoice tracking.</p>
            <button
              className="text-sm text-amber-700 hover:underline"
              onClick={() => setDismissMissingBilling(true)}
            >Dismiss</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Key Metrics Summary - 2 focused cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold text-primary-700">{activeProjects.length}</p>
                  <p className="text-xs text-neutral-500 mt-1">Currently tracking time</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${nextInvoice ? 'bg-amber-400' : 'bg-green-400'}`}></div>
                    <span className="text-sm font-medium text-neutral-600">Next Invoice Due</span>
                  </div>
                  {nextInvoice ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-neutral-900">{nextInvoice.projectName}</p>
                      <p className="text-sm text-neutral-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200 inline-block">
                        Due: {nextInvoice.dueDate.toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-green-700">All Up to Date</p>
                      <p className="text-sm text-neutral-500">No invoices due</p>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  nextInvoice ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <svg className={`w-6 h-6 ${nextInvoice ? 'text-amber-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-neutral-200/60 p-2 rounded-xl w-full max-w-2xl mx-auto mb-8 shadow-lg shadow-neutral-900/5 gap-1 overflow-x-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-md
                        px-3 sm:px-6 py-3.5 rounded-lg text-xs sm:text-sm font-semibold text-neutral-600 hover:text-primary-700 
                        hover:bg-neutral-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[130px] justify-center whitespace-nowrap"
            >
              <span className="text-sm sm:text-base">📊</span>
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="time"
              className="data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-md
                        px-3 sm:px-6 py-3.5 rounded-lg text-xs sm:text-sm font-semibold text-neutral-600 hover:text-primary-700 
                        hover:bg-neutral-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[130px] justify-center whitespace-nowrap"
            >
              <span className="text-sm sm:text-base">⏱️</span>
              <span className="hidden sm:inline">Time Tracking</span>
              <span className="sm:hidden">Time</span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-md
                        px-3 sm:px-6 py-3.5 rounded-lg text-xs sm:text-sm font-semibold text-neutral-600 hover:text-primary-700 
                        hover:bg-neutral-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[130px] justify-center whitespace-nowrap"
            >
              <span className="text-sm sm:text-base">📁</span>
              <span className="hidden sm:inline">Projects</span>
              <span className="sm:hidden">Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-md
                        px-3 sm:px-6 py-3.5 rounded-lg text-xs sm:text-sm font-semibold text-neutral-600 hover:text-primary-700 
                        hover:bg-neutral-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[130px] justify-center whitespace-nowrap"
            >
              <span className="text-sm sm:text-base">🧾</span>
              <span className="hidden sm:inline">Invoices</span>
              <span className="sm:hidden">Bills</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Chart gets its own dedicated space */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">Monthly Revenue</h3>
                    <p className="text-sm text-neutral-600">Revenue tracking across all projects</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Revenue ($)</span>
                  </div>
                </div>
                <RevenueChart entries={entries} projects={projects} />
              </CardContent>
            </Card>

            {/* Additional overview metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border border-neutral-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 mb-1">This Month's Entries</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-neutral-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 mb-1">Total Hours This Month</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {entries
                        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                        .reduce((sum, e) => sum + e.hours, 0)
                        .toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-neutral-200 shadow-sm sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 mb-1">Uninvoiced Entries</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {filteredEntries.filter(e => !e.invoiced).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="pt-6">
            <Card><CardContent className="p-6 space-y-6">
                <TimeEntryForm
                projects={projects}
                onAdd={setEntries}
                editingEntry={editingEntry}
                setEditingEntry={setEditingEntry}
                onDelete={handleDeleteEntry}
              />

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <select
                  className="w-full sm:w-auto px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  className="w-full sm:w-auto px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
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
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Export CSV
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={showAllEntries}
                    onChange={() => setShowAllEntries(!showAllEntries)}
                    className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
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
                onToggleActive={async (projectId: string, newValue: boolean) => {
                  // Handle project active toggle here
                  console.log('Toggle project:', projectId, newValue);
                }}
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
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
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
