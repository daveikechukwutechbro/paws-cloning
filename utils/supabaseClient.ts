// utils/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxzqkxfqslmyaofzotex.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4enFreGZxc2xteWFvZnpvdGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzU0NTAsImV4cCI6MjA5MTgxMTQ1MH0.NVqoVAvb1nClF8FLzzOOq5e-0lkY6KH53V5Xpd0DDIE'

export const supabase = createClient(supabaseUrl, supabaseKey)