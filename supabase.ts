import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://raweqyxkahiwrewxarka.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LlqGTGw8AUFE5jhT3Sk1Tw_tpzFY4Uy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
