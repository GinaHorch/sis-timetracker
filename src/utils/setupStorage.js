// Run this script once to create the invoices bucket
// You can delete this file after running it

import { supabase } from '../supabaseClient.js';

async function createInvoicesBucket() {
  try {
    // Create the invoices bucket
    const { error } = await supabase.storage.createBucket('invoices', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "invoices" already exists');
      } else {
        console.error('❌ Error creating bucket:', error.message);
      }
    } else {
      console.log('✅ Successfully created "invoices" bucket');
    }

    // Verify bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
    } else {
      const invoicesBucket = buckets.find(bucket => bucket.name === 'invoices');
      if (invoicesBucket) {
        console.log('✅ Confirmed "invoices" bucket exists');
      } else {
        console.log('❌ "invoices" bucket not found in bucket list');
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
createInvoicesBucket();
