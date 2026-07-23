import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'sb_publishable_aFAMtCQzMOw427Dxnk9K-Q_OYpAD7Gm';
const supabaseAnonKey = 'sb_secret_obLZ0wczP5Ikdxt-_7XuBA_E8VD9zjx.';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
