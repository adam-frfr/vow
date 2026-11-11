import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iyqyqeqfvggaqdsxnxem.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXlxZXFmdmdnYXFkc3hueGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDM3ODA5NCwiZXhwIjoyMTA5OTU0MDk0fQ.D1ca5TX96ibFTRFM2zRMRk-fenlrYJ-PeXcB2iQiig4";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
