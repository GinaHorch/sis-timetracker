export function isInvoiceDay(startDate: Date, billingCycle: string, today: Date = new Date()): boolean {
  const diffInDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return false; // Start date is in the future
  
  switch (billingCycle) {
    case 'weekly':
      return diffInDays % 7 === 0;
    case 'fortnightly':
      return diffInDays % 14 === 0;
    case 'monthly':
      // For monthly, check if it's the same day of the month
      return today.getDate() === startDate.getDate();
    default:
      return false;
  }
}