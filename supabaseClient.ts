import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ylgxwalzpacfnaqupxjo.supabase.co';
// Chave pública fornecida. Nota: Em projetos padrão Supabase, a chave geralmente começa com "ey...", 
// mas usaremos a string fornecida. Se houver erro de autenticação, verifique se esta é a "anon key" ou "public key" no painel.
const SUPABASE_ANON_KEY = 'sb_publishable_2D5z-eqKVW50qKPk4h_T4w_AlP85UCi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);