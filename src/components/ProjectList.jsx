export default function ProjectList({ projects }) {
  return (
    <ul className="mt-4 space-y-1">
      {projects.map((p) => (
        <li key={p.id} className="border p-2 rounded">
          <strong>{p.name}</strong> — {p.financialYear}
        </li>
      ))}
    </ul>
  );
}
