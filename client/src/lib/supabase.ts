import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://txzbzpnrclkdodosbndy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4emJ6cG5yY2xrZG9kb3NibmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0Mjc0OTksImV4cCI6MjA4MzAwMzQ5OX0.aRrQQxjoEaLFv2pY4wpLpt-CCdg6884JOToxHLISuFU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
