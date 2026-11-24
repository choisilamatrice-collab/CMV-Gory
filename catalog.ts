// Catalogue des personnalisations de Gory.
// Les identifiants doivent être identiques à ceux de la table Supabase « gory_items ».

export type Slot = 'eyes' | 'fur' | 'glasses' | 'bottom' | 'headwear';

export interface GoryItem {
  id: string;
  slot: Slot;
  label: string;
  isFree: boolean;
  swatch: string; // couleur affichée dans le sélecteur
  priceCents?: number; // pour la boutique (phase 2)
}

export interface GoryLook {
  eyes: string;
  fur: string;
  glasses: string;
  bottom: string;
  headwear: string;
}

export const SLOT_LABELS: Record<Slot, string> = {
  eyes: 'Couleur des yeux',
  fur: 'Nuance du pelage',
  glasses: 'Lunettes',
  bottom: 'Short ou pantalon',
  headwear: 'Petit accessoire',
};

export const EYE_COLORS: Record<string, string> = {
  eyes_ambre: '#e8a321',
  eyes_marron: '#8a5427',
  eyes_bleu: '#1e8bff',
  eyes_vert: '#25b86a',
  eyes_rouge: '#e3262f',
};

export const FUR_SHADES: Record<string, { base: string; light: string }> = {
  fur_noir: { base: '#1c1c22', light: '#3b3b46' },
  fur_argent: { base: '#4f535c', light: '#8d929c' },
  fur_brun: { base: '#4a2f1f', light: '#77513a' },
  fur_chocolat: { base: '#2d1e17', light: '#54392d' },
};

export const BOTTOM_STYLES: Record<string, { color: string; long: boolean }> = {
  bottom_short_rouge: { color: '#d81f2a', long: false },
  bottom_short_bleu: { color: '#1565e0', long: false },
  bottom_pantalon_noir: { color: '#0d0d10', long: true },
};

export const FREE_ITEMS: GoryItem[] = [
  { id: 'eyes_ambre', slot: 'eyes', label: 'Ambre', isFree: true, swatch: EYE_COLORS.eyes_ambre },
  { id: 'eyes_marron', slot: 'eyes', label: 'Noisette', isFree: true, swatch: EYE_COLORS.eyes_marron },
  { id: 'eyes_bleu', slot: 'eyes', label: 'Bleu électrique', isFree: true, swatch: EYE_COLORS.eyes_bleu },
  { id: 'eyes_vert', slot: 'eyes', label: 'Vert jungle', isFree: true, swatch: EYE_COLORS.eyes_vert },
  { id: 'eyes_rouge', slot: 'eyes', label: 'Rouge CMV', isFree: true, swatch: EYE_COLORS.eyes_rouge },

  { id: 'fur_noir', slot: 'fur', label: 'Noir profond', isFree: true, swatch: FUR_SHADES.fur_noir.light },
  { id: 'fur_argent', slot: 'fur', label: 'Dos argenté', isFree: true, swatch: FUR_SHADES.fur_argent.light },
  { id: 'fur_brun', slot: 'fur', label: 'Brun', isFree: true, swatch: FUR_SHADES.fur_brun.light },
  { id: 'fur_chocolat', slot: 'fur', label: 'Chocolat', isFree: true, swatch: FUR_SHADES.fur_chocolat.light },

  { id: 'glasses_none', slot: 'glasses', label: 'Sans lunettes', isFree: true, swatch: 'transparent' },
  { id: 'glasses_rondes', slot: 'glasses', label: 'Rondes', isFree: true, swatch: '#111111' },
  { id: 'glasses_carrees_rouges', slot: 'glasses', label: 'Carrées rouges', isFree: true, swatch: '#e3262f' },
  { id: 'glasses_bleues', slot: 'glasses', label: 'Verres bleus', isFree: true, swatch: '#1e8bff' },

  { id: 'bottom_short_rouge', slot: 'bottom', label: 'Short rouge', isFree: true, swatch: BOTTOM_STYLES.bottom_short_rouge.color },
  { id: 'bottom_short_bleu', slot: 'bottom', label: 'Short bleu', isFree: true, swatch: BOTTOM_STYLES.bottom_short_bleu.color },
  { id: 'bottom_pantalon_noir', slot: 'bottom', label: 'Pantalon noir', isFree: true, swatch: '#2a2a30' },

  { id: 'headwear_none', slot: 'headwear', label: 'Rien', isFree: true, swatch: 'transparent' },
  { id: 'headwear_casquette_rouge', slot: 'headwear', label: 'Casquette rouge', isFree: true, swatch: '#d81f2a' },
  { id: 'headwear_casquette_bleue', slot: 'headwear', label: 'Casquette bleue', isFree: true, swatch: '#1565e0' },
  { id: 'headwear_bandeau_rouge', slot: 'headwear', label: 'Bandeau rouge', isFree: true, swatch: '#e3262f' },
  { id: 'headwear_noeud_bleu', slot: 'headwear', label: 'Petit nœud bleu', isFree: true, swatch: '#1e8bff' },
];

export const DEFAULT_LOOK: GoryLook = {
  eyes: 'eyes_ambre',
  fur: 'fur_noir',
  glasses: 'glasses_none',
  bottom: 'bottom_short_rouge',
  headwear: 'headwear_none',
};

/** Objets proposés pour un emplacement : gratuits + (plus tard) ceux achetés. */
export function itemsForSlot(slot: Slot, ownedItems: GoryItem[] = []): GoryItem[] {
  return [...FREE_ITEMS, ...ownedItems].filter((i) => i.slot === slot);
}

export function randomLook(): GoryLook {
  const pick = (slot: Slot) => {
    const list = itemsForSlot(slot);
    return list[Math.floor(Math.random() * list.length)].id;
  };
  return { eyes: pick('eyes'), fur: pick('fur'), glasses: pick('glasses'), bottom: pick('bottom'), headwear: pick('headwear') };
}
