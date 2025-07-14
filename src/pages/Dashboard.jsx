import { useState, useEffect } from 'react';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import TimeEntryForm from '../components/TimeEntryForm';
import TimeSheetTable from '../components/TimeSheetTable';
import { getProjects, getEntries } from '../utils/storage';
import { saveAs } from 'file-saver';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    setProjects(getProjects());
    setEntries(getEntries());
  }, []);

const filteredEntries = entries.filter(entry => {
    const project = projects.find(p => p.id === entry.projectId);
    return (
      (!filterProject || entry.projectId === filterProject) &&
      (!filterYear || project?.financialYear === filterYear)
    );
  });

  const exportCSV = () => {
    const rows = filteredEntries.map(e => {
      const project = projects.find(p => p.id === e.projectId);
      return {
        Date: e.date,
        Project: project?.name || '',
        FinancialYear: project?.financialYear || '',
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

      <TimeEntryForm projects={projects} onAdd={setEntries} />

      <div className="mt-4 flex gap-4 items-center flex-wrap">
        <select className="border p-1" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select className="border p-1" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All Financial Years</option>
          {[...new Set(projects.map(p => p.financialYear))].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-1 rounded">Export CSV</button>
      </div>

      <TimeSheetTable entries={filteredEntries} projects={projects} />
    </div>
  );
}
