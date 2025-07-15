export function getNextInvoiceNumber() {
  const current = parseInt(localStorage.getItem('invoiceCounter') || '1', 10);
  localStorage.setItem('invoiceCounter', current + 1);
  return `SIS-${String(current).padStart(4, '0')}`; // SIS-0001, SIS-0002...
}