import { createClient } from '@supabase/supabase-js';

// Trovi questi due valori dentro Supabase -> Project Settings -> API
const supabaseUrl = 'https://IL-TUO-PROGETTO.supabase.co';
const supabaseAnonKey = 'Organizzatore1.';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
