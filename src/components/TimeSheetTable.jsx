import { formatDate } from "../utils/date";

export default function TimeSheetTable({ entries, projects, onEdit, onDelete }) {
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
            <th className="border px-2 py-1">Actions</th> 
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td className="border px-2 py-1">{formatDate(entry.date)}</td>
              <td className="border px-2 py-1">{getProjectName(entry.project_id)}</td>
              <td className="border px-2 py-1">{entry.hours}</td>
              <td className="border px-2 py-1">{entry.notes}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  onClick={() => onEdit(entry)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
