// CMV Gorille : connexion → adoption (si pas encore de Gory) → accueil.
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './supabase';
import AuthScreen from './AuthScreen';
import GoryGate from './GoryGate';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="gs-screen">
        <p className="gs-error" style={{ maxWidth: 360, textAlign: 'center' }}>
          Configuration manquante : ajoute VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Netlify (Site configuration → Environment variables), puis redéploie.
        </p>
      </div>
    );
  }
  if (!ready) return <div className="gs-screen"><p className="gs-hint">Gory arrive…</p></div>;
  if (!session) return <AuthScreen />;

  return (
    <GoryGate
      key={session.user.id}
      onNavigate={(tab) => {
        if (tab === 'profil' && window.confirm('Se déconnecter ?')) void supabase.auth.signOut();
      }}
    />
  );
}
