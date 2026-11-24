// Toutes les communications entre l'application et Supabase pour Gory.
// ⚠️ Adapte le chemin ci-dessous si ton client Supabase est ailleurs dans CMV Progress.
import { supabase } from './supabase';
import type { GoryLook } from './catalog';
import type { GorySex, XpSource } from './progression';

export interface GoryProfile {
  user_id: string;
  name: string;
  eye_color: string;
  fur_shade: string;
  glasses: string;
  bottom: string;
  headwear: string;
  sex: GorySex;
  xp: number;
  adopted_at: string;
  updated_at: string;
}

export function lookFromProfile(p: GoryProfile): GoryLook {
  return { eyes: p.eye_color, fur: p.fur_shade, glasses: p.glasses, bottom: p.bottom, headwear: p.headwear };
}

function lookToColumns(l: GoryLook) {
  return { eye_color: l.eyes, fur_shade: l.fur, glasses: l.glasses, bottom: l.bottom, headwear: l.headwear };
}

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Tu dois être connecté pour adopter Gory.');
  return data.user.id;
}

/** Renvoie le Gory de l'utilisateur, ou null s'il n'a pas encore été adopté. */
export async function fetchGoryProfile(): Promise<GoryProfile | null> {
  const uid = await currentUserId();
  const { data, error } = await supabase.from('gory_profiles').select('*').eq('user_id', uid).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as GoryProfile | null) ?? null;
}

export async function createGoryProfile(name: string, look: GoryLook, sex: GorySex): Promise<GoryProfile> {
  const uid = await currentUserId();
  const { data, error } = await supabase
    .from('gory_profiles')
    .insert({ user_id: uid, name: name.trim(), sex, ...lookToColumns(look) })
    .select('*')
    .single();
  if (error) throw new Error(error.code === '23505' ? 'Tu as déjà adopté un Gory !' : error.message);
  return data as GoryProfile;
}

/** Changer le look ou le prénom plus tard (écran « Personnaliser »). */
export async function updateGoryLook(look: GoryLook, name?: string): Promise<GoryProfile> {
  const uid = await currentUserId();
  const changes = name ? { ...lookToColumns(look), name: name.trim() } : lookToColumns(look);
  const { data, error } = await supabase.from('gory_profiles').update(changes).eq('user_id', uid).select('*').single();
  if (error) throw new Error(error.message);
  return data as GoryProfile;
}

/** Ajoute des XP (jamais de retrait). Renvoie le nouveau total. Utilisé aux étapes 4 à 6. */
export async function awardXp(source: XpSource, amount: number, ref?: string): Promise<number> {
  const { data, error } = await supabase.rpc('award_xp', { p_source: source, p_amount: amount, p_ref: ref ?? null });
  if (error) throw new Error(error.message);
  return data as number;
}
