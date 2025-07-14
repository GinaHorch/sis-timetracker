const PROJECTS_KEY = 'projects';
const ENTRIES_KEY = 'timeEntries';

export function getProjects() {
  return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || [];
}

export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getEntries() {
  return JSON.parse(localStorage.getItem(ENTRIES_KEY)) || [];
}

export function saveEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function clearEntries() {
  localStorage.removeItem(ENTRIES_KEY);
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
