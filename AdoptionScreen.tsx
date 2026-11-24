// Écran d'adoption : prénom + personnalisation gratuite + animation de réveil.
import { useEffect, useRef, useState } from 'react';
import GoryAvatar, { type GoryMood } from './GoryAvatar';
import GoryPortrait, { goryImage } from './GoryPortrait';
import { DEFAULT_LOOK, SLOT_LABELS, itemsForSlot, randomLook, type GoryLook, type Slot } from './catalog';
import { createGoryProfile, type GoryProfile } from './goryApi';
import type { GorySex } from './progression';

const STEPS: Array<'sex' | 'name' | Slot> = ['sex', 'name', 'eyes', 'fur', 'glasses', 'bottom', 'headwear'];
type Phase = 'customize' | 'saving' | 'sleeping' | 'waking' | 'greeting';

const MOOD_BY_PHASE: Record<Phase, GoryMood> = {
  customize: 'idle',
  saving: 'sleeping',
  sleeping: 'sleeping',
  waking: 'waking',
  greeting: 'wave',
};

interface Props {
  userFirstName?: string;
  onAdopted: (profile: GoryProfile) => void;
}

export default function AdoptionScreen({ userFirstName, onAdopted }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [sex, setSex] = useState<GorySex | null>(null);
  const [look, setLook] = useState<GoryLook>(DEFAULT_LOOK);
  const [phase, setPhase] = useState<Phase>('customize');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GoryProfile | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const current = STEPS[step];
  const trimmed = name.trim();
  const canGoOn = current === 'sex' ? sex !== null : current !== 'name' || (trimmed.length >= 1 && trimmed.length <= 20);
  const female = sex === 'female';
  const isLast = step === STEPS.length - 1;

  async function adopt() {
    setError(null);
    setPhase('saving');
    try {
      const saved = await createGoryProfile(trimmed, look, sex ?? 'male');
      setProfile(saved);
      setPhase('sleeping');
      timers.current.push(window.setTimeout(() => setPhase('waking'), 1300));
      timers.current.push(window.setTimeout(() => setPhase('greeting'), 3000));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Oups, l'adoption n'a pas fonctionné.");
      setPhase('customize');
    }
  }

  function next() {
    if (!canGoOn) return;
    if (isLast) void adopt();
    else setStep(step + 1);
  }

  const title =
    phase === 'greeting' ? `${trimmed} est ${female ? 'réveillée' : 'réveillé'} !` : phase === 'customize' ? 'Adopte ton bébé Gory' : 'Adoption en cours…';

  return (
    <div className="gs-screen">
      <header className="gs-header">
        <p className="gs-kicker">Choisis la Matrice de ta Vie</p>
        <h1>{title}</h1>
      </header>

      <div className={`gs-stage ${phase !== 'customize' ? 'gs-stage--adopt' : ''}`}>
        {phase === 'customize' && current === 'sex' ? null : phase === 'customize' ? (
          <GoryAvatar look={look} stage="bebe" mood="idle" size={210} title={trimmed || 'Gory'} />
        ) : (
          <GoryPortrait stage="bebe" sex={sex ?? 'male'} name={trimmed} mood={MOOD_BY_PHASE[phase]} glow={phase === 'greeting'} size={260} />
        )}
      </div>

      {phase === 'greeting' && profile ? (
        <div className="gs-card gs-bubble">
          <p>
            Salut {userFirstName || 'toi'} ! Moi c'est <strong>{profile.name}</strong>. Merci de m'avoir {female ? 'adoptée' : 'adopté'}.
            <br />
            On va grandir ensemble, un choix après l'autre. 💪
          </p>
          <button className="gs-btn gs-btn--red" onClick={() => onAdopted(profile)}>
            C'est parti !
          </button>
        </div>
      ) : phase !== 'customize' ? (
        <p className="gs-hint">{phase === 'saving' ? 'Préparation du nid…' : 'Chut… il se réveille…'}</p>
      ) : (
        <div className="gs-card">
          <div className="gs-progress" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? 'on' : ''} />
            ))}
          </div>

          <h2>{current === 'sex' ? 'Un petit gorille ou une petite gorille ?' : current === 'name' ? 'Comment vas-tu l’appeler ?' : SLOT_LABELS[current]}</h2>

          {current === 'sex' ? (
            <div className="gs-sex">
              {(['male', 'female'] as const).map((s) => (
                <button key={s} type="button" className={`gs-sex-card ${sex === s ? 'is-selected' : ''}`} onClick={() => setSex(s)}>
                  <img src={goryImage('bebe', s)} alt="" />
                  <span>{s === 'male' ? 'Mâle' : 'Femelle'}</span>
                </button>
              ))}
            </div>
          ) : current === 'name' ? (
            <input
              className="gs-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && next()}
              maxLength={20}
              placeholder="Ex : Kong, Mimi, Rocky…"
              autoFocus
            />
          ) : (
            <div className="gs-options">
              {itemsForSlot(current).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`gs-option ${look[current] === item.id ? 'is-selected' : ''}`}
                  onClick={() => setLook({ ...look, [current]: item.id })}
                >
                  <span className="gs-swatch" style={{ background: item.swatch }} />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {error && <p className="gs-error">{error}</p>}

          <div className="gs-nav">
            <button className="gs-btn gs-btn--ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Retour
            </button>
            {current !== 'name' && current !== 'sex' && (
              <button className="gs-btn gs-btn--ghost" onClick={() => setLook(randomLook())} aria-label="Look au hasard">
                🎲
              </button>
            )}
            <button className={`gs-btn ${isLast ? 'gs-btn--red' : 'gs-btn--blue'}`} disabled={!canGoOn} onClick={next}>
              {isLast ? `Adopter ${trimmed}` : 'Suivant'}
            </button>
          </div>

          <p className="gs-note">Tu pourras changer son look plus tard. D’autres accessoires arriveront dans la boutique.</p>
        </div>
      )}
    </div>
  );
}
