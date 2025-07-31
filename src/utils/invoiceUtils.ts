import { Project } from '../services/projectService';

export function getNextInvoiceDue(projects: Project[]): {
  projectName: string;
  dueDate: Date;
} | null {
  const today = new Date();

  const dueDates = projects
    .filter(p => p.is_active && p.billing_start_date && p.billing_cycle)
    .map(p => {
      const start = new Date(p.billing_start_date!);
      const next = getNextCycleDate(start, p.billing_cycle!, today);
      return { projectName: p.name, dueDate: next };
    })
    .filter(d => d.dueDate > today)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return dueDates.length > 0 ? dueDates[0] : null;
}

function getNextCycleDate(start: Date, cycle: string, from: Date): Date {
  const next = new Date(start);
  while (next <= from) {
    if (cycle === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (cycle === 'fortnightly') next.setDate(next.getDate() + 14);
    else break;
  }
  return next;
}