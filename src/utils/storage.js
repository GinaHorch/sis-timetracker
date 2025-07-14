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