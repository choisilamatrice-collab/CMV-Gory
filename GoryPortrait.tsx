// Gory officiel : une illustration par stade d'évolution.
// Les images sont dans public/gory/ (bebe, jeune, guerrier, legendaire, + versions -f).
import type { GorySex, StageId } from './progression';
import type { GoryMood } from './GoryAvatar';

import bebe from './bebe.webp';
import jeune from './jeune.webp';
import guerrier from './guerrier.webp';
import legendaire from './legendaire.webp';
import bebeF from './bebe-f.webp';
import jeuneF from './jeune-f.webp';
import guerrierF from './guerrier-f.webp';
import legendaireF from './legendaire-f.webp';

const IMAGES: Record<GorySex, Record<StageId, string>> = {
  male: { bebe, jeune, guerrier, legendaire },
  female: { bebe: bebeF, jeune: jeuneF, guerrier: guerrierF, legendaire: legendaireF },
};

export function goryImage(stage: StageId, sex: GorySex = 'male'): string {
  return IMAGES[sex][stage];
}

interface Props {
  stage: StageId;
  sex?: GorySex;
  name: string;
  mood?: GoryMood;
  glow?: boolean; // récompense : halo lumineux
  size?: number;
  onClick?: () => void;
}

export default function GoryPortrait({ stage, sex = 'male', name, mood = 'idle', glow = false, size = 300, onClick }: Props) {
  const classes = ['gp', `gp--${mood}`, glow ? 'gp--glow' : '', stage === 'legendaire' ? 'gp--legend' : '', onClick ? 'gory--clickable' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} style={{ width: size }} onClick={onClick} role="img" aria-label={name}>
      <img src={goryImage(stage, sex)} alt="" draggable={false} />
    </div>
  );
}
