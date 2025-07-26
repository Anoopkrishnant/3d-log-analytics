import { createClient } from '@supabase/supabase-js';

const supabaseUrl =  'https://jnivhgsheolfjbvgqnxj.supabase.co';
const supabaseServiceRoleKey =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaXZoZ3NoZW9sZmpidmdxbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjM0ODcsImV4cCI6MjA2ODQ5OTQ4N30.lmeK1Hv0PJX2H1fZscHBMIQmr3i_vvSK8yqueLjPJM8";


export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);
