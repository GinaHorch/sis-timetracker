import { TimeEntry } from "@/services/timeService";
import { Project } from "@/services/projectService";
import { formatDate } from "../utils/date";

interface TimeSheetTableProps {
  entries: (TimeEntry & { invoiced?: boolean })[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

export default function TimeSheetTable({ entries, projects, onEdit, onDelete }: TimeSheetTableProps) {
  const getProjectName = (id: string): string => 
    projects.find((p) => p.id === id)?.name || 'Unknown';

  return (
    <div className="mt-6">
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 border border-neutral-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-neutral-500 text-sm">No time entries found</p>
          <p className="text-neutral-400 text-xs mt-1">Add your first time entry to get started</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b border-primary-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Actions</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {entries.map((entry, index) => (
                  <tr key={entry.id} className={`hover:bg-neutral-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}`}>
                    <td className="px-4 py-3 text-sm text-neutral-900 font-medium">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{getProjectName(entry.project_id)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 font-medium">{entry.hours} hrs</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      <div className="max-w-xs truncate" title={entry.notes || 'No notes'}>
                        {entry.notes || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                        {entry.invoiced ? (
                          <span className="text-green-700 text-xs bg-green-100 px-2 py-0.5 rounded-full">Invoiced</span>
                        ) : (
                          <span className="text-yellow-700 text-xs bg-yellow-100 px-2 py-0.5 rounded-full">Not Invoiced</span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-md transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
