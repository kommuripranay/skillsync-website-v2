import { createClient } from '@supabase/supabase-js';

// 1. Add your Supabase Project URL
const supabaseUrl = 'https://xkofhaaanyzsdtlnjvwt.supabase.co'; 
// 2. Add your 'anon' (public) key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrb2ZoYWFhbnl6c2R0bG5qdnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjgyNDMsImV4cCI6MjA3ODk0NDI0M30.DnAMuFNqa4unNCCQsHu_rBV1i8Z1UN84yMBolzWIzU8';    

// 3. This creates the client
export const supabase = createClient(supabaseUrl, supabaseKey);