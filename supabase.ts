import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);

// Si les variables manquent, l'application affiche un message clair au lieu de planter.
export const supabase = createClient(url || 'https://manquant.supabase.co', key || 'cle-manquante');
