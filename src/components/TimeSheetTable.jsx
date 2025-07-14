import { formatDate } from "../utils/storage";

export default function TimeSheetTable({ entries, projects }) {
  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="mt-6">
      <table className="w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Project</th>
            <th className="border px-2 py-1">Hours</th>
            <th className="border px-2 py-1">Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td className="border px-2 py-1">{formatDate(entry.date)}</td>
              <td className="border px-2 py-1">{getProjectName(entry.projectId)}</td>
              <td className="border px-2 py-1">{entry.hours}</td>
              <td className="border px-2 py-1">{entry.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
