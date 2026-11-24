// Aiguillage : si l'utilisateur n'a pas encore de Gory → adoption, sinon → accueil.
// À afficher à l'endroit où ton application montre l'écran principal après connexion.
import { useEffect, useState } from 'react';
import AdoptionScreen from './AdoptionScreen';
import HomeScreen, { type HomeActions } from './HomeScreen';
import { fetchGoryProfile, type GoryProfile } from './goryApi';

interface Props extends HomeActions {
  userFirstName?: string;
}

export default function GoryGate({ userFirstName, ...actions }: Props) {
  const [profile, setProfile] = useState<GoryProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchGoryProfile()
      .then((p) => alive && (setProfile(p), setStatus('ready')))
      .catch((e: unknown) => alive && (setError(e instanceof Error ? e.message : String(e)), setStatus('error')));
    return () => {
      alive = false;
    };
  }, []);

  if (status === 'loading') return <div className="gs-screen"><p className="gs-hint">Gory arrive…</p></div>;
  if (status === 'error') return <div className="gs-screen"><p className="gs-error">Impossible de charger Gory : {error}</p></div>;
  if (!profile) return <AdoptionScreen userFirstName={userFirstName} onAdopted={setProfile} />;
  return <HomeScreen profile={profile} {...actions} />;
}
