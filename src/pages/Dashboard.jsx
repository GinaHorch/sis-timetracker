import { useState, useEffect } from 'react';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import { getProjects } from '../utils/storage';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Time Tracker Dashboard</h1>
      <ProjectForm onAdd={setProjects} />
      <ProjectList projects={projects} />
    </div>
  );
}
