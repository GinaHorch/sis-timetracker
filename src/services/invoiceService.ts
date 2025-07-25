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

export async function saveInvoiceToSupabase({
  project_id,
  client_id,
  invoice_number,
  start_date,
  end_date,
  total_amount,
  total_hours,
  pdfBlob,
}: {
  project_id: string;
  client_id: string;
  invoice_number: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  total_hours: number;
  pdfBlob: Blob;
}): Promise<string | null> {
  const filePath = `${project_id}/${invoice_number}.pdf`;

  // Upload PDF to Supabase Storage
  const { data: storageData, error: uploadError } = await supabase
    .storage
    .from('invoices')
    .upload(filePath, pdfBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('Upload error:', uploadError.message);
    return null;
  }

  // Get public URL (since bucket is public)
  const { data: publicUrlData } = supabase
    .storage
    .from('invoices')
    .getPublicUrl(filePath);
  
  const publicUrl = publicUrlData.publicUrl;

  // Save invoice metadata
  const { error: insertError } = await supabase
    .from('invoices')
    .insert([
      {
        project_id,
        client_id,
        invoice_number,
        start_date,
        end_date,
        total_amount,
        total_hours,
        pdf_url: publicUrl,
      },
    ]);

  if (insertError) {
    console.error('DB insert error:', insertError.message);
    return null;
  }

  return publicUrl;
}