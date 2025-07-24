export function isInvoiceDay(startDateStr: string): boolean {
  const today = new Date();
  const startDate = new Date(startDateStr);
  const diffInDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays >= 0 && diffInDays % 14 === 0;
}