import { useState, useEffect } from 'react';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import TimeEntryForm from '../components/TimeEntryForm';
import TimeSheetTable from '../components/TimeSheetTable';
import InvoiceForm from '../components/InvoiceForm';
import { fetchProjects, Project } from '../services/projectService';
import { fetchEntries, deleteEntry, TimeEntry } from '../services/timeService';
import { saveAs } from 'file-saver';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  useEffect(() => {
  const loadData = async () => {
    const [projectData, entryData] = await Promise.all([
      fetchProjects(),
      fetchEntries()
    ]);
    setProjects(projectData);
    setEntries(entryData);
  };

  loadData();
}, []);

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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SIS Time Tracker</h1>

      <ProjectForm onAdd={setProjects} />
      <ProjectList projects={projects} />

      <hr className="my-6" />

      <TimeEntryForm
        projects={projects}
        onAdd={(newEntries) => {
          setEntries(newEntries);   // Already good
          console.log('Dashboard received new entries');
        }}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        editingEntry={editingEntry}
        setEditingEntry={setEditingEntry}
        onCancel={() => setEditingEntry(null)}
      />

      <div className="mt-4 flex gap-4 items-center flex-wrap">
        <select className="border p-1" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select className="border p-1" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All Financial Years</option>
          {[...new Set(projects.map(p => p.financial_year))].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-1 rounded">Export CSV</button>
      </div>

      <TimeSheetTable 
          entries={filteredEntries} 
          projects={projects} 
          onEdit={handleEditEntry} 
          onDelete={handleDeleteEntry} />

      <InvoiceForm />
    </div>
  );
}

export default Dashboard;
