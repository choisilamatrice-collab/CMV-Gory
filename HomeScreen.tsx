// Écran d'accueil – style CMV « matrice » : logo néon, portail rouge/bleu autour de Gory,
// choix des pilules, défi du jour, actions rapides et barre de navigation.
import { useEffect, useRef, useState } from 'react';
import { type GoryMood } from './GoryAvatar';
import GoryPortrait from './GoryPortrait';
import { type GoryProfile } from './goryApi';
import { progressInfo, stageLabel } from './progression';

// Phrases d'accueil : toujours encourageantes, jamais culpabilisantes.
const GREETINGS = [
  'Content de te voir ! On choisit quoi aujourd’hui ?',
  'Chaque petit pas compte. Je suis là.',
  'Choix difficile, vie facile. On y va ensemble ?',
  'Pas de pression : on avance à ton rythme.',
  'Fais évoluer ta vie, je grandis avec toi.',
];
const REACTIONS = ['Hé, ça chatouille ! 😄', 'Tape-m’en cinq ! ✋', 'Je grandis grâce à toi.', 'On forme une sacrée équipe !'];
const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

export type HomeTab = 'accueil' | 'defis' | 'matrice' | 'profil';

export interface HomeActions {
  onTalk?: () => void;
  onWrite?: () => void;
  onPlay?: () => void;
  onChallenges?: () => void;
  onCustomize?: () => void;
  onPill?: (pill: 'rouge' | 'bleue') => void; // étape 5 : écran des pilules
  onNavigate?: (tab: HomeTab) => void;
}

interface Props extends HomeActions {
  profile: GoryProfile;
  celebrate?: boolean; // à true juste après un gain d'XP (étape 6)
  dailyChallenge?: { title: string; done?: boolean };
}

export default function HomeScreen({
  profile,
  celebrate = false,
  dailyChallenge = { title: 'Effectue une activité physique de 30 min' },
  onTalk,
  onWrite,
  onPlay,
  onChallenges,
  onCustomize,
  onPill,
  onNavigate,
}: Props) {
  const info = progressInfo(profile.xp);
  const [mood, setMood] = useState<GoryMood>(celebrate ? 'celebrate' : 'idle');
  const [line, setLine] = useState(() => pick(GREETINGS));
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function poke() {
    setMood('celebrate');
    setLine(pick(REACTIONS));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMood('idle'), 1900);
  }

  return (
    <div className="gs-screen hm">
      <header className="hm-brand">
        <div className="hm-logo" aria-label="CMV">
          <span className="hm-logo-c">CM</span>
          <span className="hm-logo-v">V</span>
        </div>
        <p className="hm-tagline">Choisis la matrice de ta vie</p>
      </header>

      <section className="hm-hero">
        <div className="hm-portal">
          <GoryPortrait stage={info.stage.id} sex={profile.sex} name={profile.name} mood={mood} glow={celebrate} size={250} onClick={poke} />
        </div>
        <div className="hm-speech">{line}</div>
      </section>

      <section className="hm-id">
        <div className="hm-id-row">
          <strong>{profile.name}</strong>
          <span className="hm-chip">{stageLabel(info.stage, profile.sex)}</span>
        </div>
        <div className="gs-level">
          <span>Niveau {info.level}</span>
          <span>
            {info.xpIntoLevel} / {info.xpForNextLevel} XP
          </span>
        </div>
        <div className="gs-xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={info.percent}>
          <div style={{ width: `${info.percent}%` }} />
        </div>
        <p className="hm-next">{info.nextStage ? `${stageLabel(info.nextStage, profile.sex)} au niveau ${info.nextStage.minLevel}` : 'Stade maximum atteint 👑'}</p>
      </section>

      <section className="hm-block">
        <h2>Quelle matrice choisis-tu ?</h2>
        <div className="hm-pills">
          <button className="hm-pill hm-pill--rouge" onClick={() => onPill?.('rouge')} disabled={!onPill}>
            Rouge
            <small>Le choix difficile</small>
          </button>
          <button className="hm-pill hm-pill--bleue" onClick={() => onPill?.('bleue')} disabled={!onPill}>
            Bleue
            <small>Le choix facile</small>
          </button>
        </div>
      </section>

      <section className="hm-block">
        <h2>Défi du jour</h2>
        <button className="hm-challenge" onClick={onChallenges} disabled={!onChallenges}>
          <span className={`hm-check ${dailyChallenge.done ? 'is-done' : ''}`}>✓</span>
          <span>{dailyChallenge.title}</span>
          <span className="hm-xp">+25 XP</span>
        </button>
      </section>

      <section className="hm-tiles">
        <button className="hm-tile hm-tile--red" onClick={onTalk} disabled={!onTalk}>
          <span>🎙️</span>Parler
        </button>
        <button className="hm-tile hm-tile--blue" onClick={onWrite} disabled={!onWrite}>
          <span>💬</span>Écrire
        </button>
        <button className="hm-tile" onClick={onPlay} disabled={!onPlay}>
          <span>🎮</span>Jouer
        </button>
        <button className="hm-tile" onClick={onCustomize} disabled={!onCustomize}>
          <span>🧢</span>Style
        </button>
      </section>

      <nav className="hm-nav">
        {(
          [
            ['accueil', 'Accueil', 'M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
            ['defis', 'Défis', 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm-4-9 3 3 5-6'],
            ['matrice', 'Matrice', 'M7 3h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8zm5 0v8M7 13h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8zm5 0v8'],
            ['profil', 'Profil', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0'],
          ] as const
        ).map(([id, label, d]) => (
          <button key={id} className={`hm-nav-item ${id === 'accueil' ? 'is-active' : ''}`} onClick={() => onNavigate?.(id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={d} />
            </svg>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
