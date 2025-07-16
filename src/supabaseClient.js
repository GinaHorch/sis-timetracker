import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://riddwxqorjmqjbwkaquh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZGR3eHFvcmptcWpid2thcXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mjk3MjUsImV4cCI6MjA2ODIwNTcyNX0.brgX_eRzoGGY6_1VzUGxHEgxxavzKp1Sj0pdpZqPd9U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);