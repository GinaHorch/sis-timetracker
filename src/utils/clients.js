const CLIENTS_KEY = 'clients';

export function getClients() {
  return JSON.parse(localStorage.getItem(CLIENTS_KEY)) || [];
}

export function saveClients(clients) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}