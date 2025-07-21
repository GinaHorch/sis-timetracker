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

  const next = (data?.counter ?? 0) + 1;

  // Update the counter
  const { error: updateError } = await supabase
    .from('invoice_counter')
    .upsert({ id: 1, counter: next });

  if (updateError) {
    console.error('Update error:', updateError.message);
    return 'SIS-ERROR';
  }

  // Return formatted invoice number
  return `SIS-${String(next).padStart(4, '0')}`;
}
