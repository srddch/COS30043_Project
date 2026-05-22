import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kplxkktxlvbtsnqyhcwi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbHhra3R4bHZidHNucXloY3dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE4MzI1MCwiZXhwIjoyMDk0NzU5MjUwfQ.g81FX-7IAaE8_593u4J5GScML99Yukvl9a8CtvZpuU4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)