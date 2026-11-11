import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzltilisyyfpraalscjx.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bHRpbGlzeXlmcHJhYWxzY2p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDM5MTE2OCwiZXhwIjoyMTA5OTY3MTY4fQ.DT4_xGClZedvGOKCTURQdjEcVbfNMQROXnVz8pmhBPc";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

