import { supabase } from '../supabaseClient';

export async function getNextInvoiceNumber() {
  // Fetch the current counter
  const { data, error: fetchError } = await supabase
    .from('invoice_counter')
    .select('counter')
    .eq('id', 1)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError.message);
    return null;
  }

  const next = data.counter;

  // Update the counter
  const { error: updateError } = await supabase
    .from('invoice_counter')
    .update({ counter: next + 1 })
    .eq('id', 1);

  if (updateError) {
    console.error('Update error:', updateError.message);
    return null;
  }

  // Return formatted invoice number
  return `SIS-${String(next).padStart(4, '0')}`;
}
