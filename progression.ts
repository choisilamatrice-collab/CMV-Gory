// Progression de Gory : les XP ne font qu'augmenter, donc le niveau et le stade aussi.

export type StageId = 'bebe' | 'jeune' | 'guerrier' | 'legendaire';

export interface Stage {
  id: StageId;
  label: string;
  labelF: string; // version femelle
  minLevel: number;
  scale: number; // taille du dessin
}

export const STAGES: Stage[] = [
  { id: 'bebe', label: 'Bébé Gory', labelF: 'Bébé Gory', minLevel: 1, scale: 0.78 },
  { id: 'jeune', label: 'Jeune Gory', labelF: 'Jeune Gory', minLevel: 5, scale: 0.88 },
  { id: 'guerrier', label: 'Gory guerrier', labelF: 'Gory guerrière', minLevel: 10, scale: 0.98 },
  { id: 'legendaire', label: 'Gory légendaire', labelF: 'Gory légendaire', minLevel: 20, scale: 1 },
];

/** XP totaux nécessaires pour atteindre un niveau. Niv.2 = 50, Niv.5 = 500, Niv.10 = 2 250, Niv.20 = 9 500. */
export function xpForLevel(level: number): number {
  return 25 * (level - 1) * level;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= Math.max(0, xp)) level++;
  return level;
}

export function stageForLevel(level: number): Stage {
  return [...STAGES].reverse().find((s) => level >= s.minLevel) ?? STAGES[0];
}

export function progressInfo(xp: number) {
  const level = levelFromXp(xp);
  const stage = stageForLevel(level);
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  const nextStage = STAGES.find((s) => s.minLevel > level) ?? null;
  return {
    level,
    stage,
    nextStage,
    xpIntoLevel: xp - start,
    xpForNextLevel: end - start,
    percent: Math.min(100, Math.round(((xp - start) / (end - start)) * 100)),
  };
}

/** Barème prévu pour les étapes suivantes (le serveur plafonne à 300 XP/jour). */
export const XP_REWARDS = {
  pill_choice: 5, // choisir une pilule : un peu
  pill_action: 30, // confirmer avoir accompli l'action : l'essentiel
  challenge: 25,
  ritual: 10,
  minigame: 10,
} as const;

export type XpSource = keyof typeof XP_REWARDS | 'other';

export type GorySex = 'male' | 'female';

export function stageLabel(stage: Stage, sex: GorySex): string {
  return sex === 'female' ? stage.labelF : stage.label;
}
