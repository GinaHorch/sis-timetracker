import { supabase } from '../supabaseClient';

interface InvoiceCounter {
  id: number;
  counter: number;
}

export async function reserveNextInvoiceNumber(): Promise<{ invoiceNumber: string; next: number } | null> {
  // Fetch the current counter
  const { data, error } = await supabase
    .from('invoice_counter')
    .select('counter')
    .eq('id', 1)
    .maybeSingle<InvoiceCounter>();

 if (error || !data) {
    console.error('Fetch error:', error?.message);
    return { invoiceNumber: 'SIS-ERROR', next: 0 };
  }

  const next = data.counter + 1;
  const invoiceNumber = `SIS-${String(next).padStart(4, '0')}`;
  return { invoiceNumber, next };
}

 export async function incrementInvoiceCounter(newValue: number): Promise<boolean> {
  const { error } = await supabase
    .from('invoice_counter')
    .update({ counter: newValue })
    .eq('id', 1);

  if (error) {
    console.error('Failed to increment invoice counter:', error);
    return false;
  }

  return true;
}
