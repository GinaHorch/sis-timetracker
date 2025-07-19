import { supabase } from '../supabaseClient';

interface InvoiceCounter {
  id: number;
  counter: number;
}

export async function getNextInvoiceNumber(): Promise<string> {
  // Fetch the current counter
  const { data, error: fetchError } = await supabase
    .from('invoice_counter')
    .select('counter')
    .eq('id', 1)
    .maybeSingle<InvoiceCounter>();

 if (fetchError || !data) {
    console.error('Fetch error:', fetchError?.message || 'Counter not found');
    return 'SIS-ERROR';
  }

  const current = data.counter;
  const next = current + 1;

  // Update the counter
  const { error: updateError } = await supabase
    .from('invoice_counter')
    .update({ counter: next })
    .eq('id', 1);

  if (updateError) {
    console.error('Update error:', updateError.message);
    return 'SIS-ERROR';
  }

  // Return formatted invoice number
  return `SIS-${String(next).padStart(4, '0')}`;
}
