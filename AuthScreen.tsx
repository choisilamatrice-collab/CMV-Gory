// Connexion / inscription par e-mail et mot de passe.
import { useState, type FormEvent } from 'react';
import { supabase } from './supabase';
import { goryImage } from './GoryPortrait';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(traduire(error.message));
      else if (!data.session) setInfo('Compte créé ! Ouvre l’e-mail de confirmation que tu viens de recevoir, puis reviens te connecter.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduire(error.message));
    }
    setBusy(false);
  }

  return (
    <div className="gs-screen hm">
      <header className="hm-brand" style={{ marginTop: 24 }}>
        <div className="hm-logo">
          <span className="hm-logo-c">CM</span>
          <span className="hm-logo-v">V</span>
        </div>
        <p className="hm-tagline">Choisis la matrice de ta vie</p>
      </header>

      <div className="hm-portal">
        <img src={goryImage('bebe')} alt="Gory" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 30, display: 'block' }} />
      </div>

      <form className="gs-card" onSubmit={submit}>
        <h2 style={{ textAlign: 'center' }}>{mode === 'signup' ? 'Crée ton compte et adopte Gory' : 'Content de te revoir !'}</h2>
        <input className="gs-input" type="email" placeholder="Ton e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input
          className="gs-input"
          style={{ marginTop: 10 }}
          type="password"
          placeholder="Mot de passe (6 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
        {error && <p className="gs-error">{error}</p>}
        {info && <p className="gs-hint">{info}</p>}
        <button className="gs-btn gs-btn--red" style={{ width: '100%', marginTop: 14 }} disabled={busy}>
          {busy ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte' : 'Me connecter'}
        </button>
        <button
          type="button"
          className="gs-btn gs-btn--ghost"
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError('');
            setInfo('');
          }}
        >
          {mode === 'signup' ? 'J’ai déjà un compte' : 'Créer un compte'}
        </button>
      </form>
    </div>
  );
}

function traduire(msg: string): string {
  if (/invalid login/i.test(msg)) return 'E-mail ou mot de passe incorrect.';
  if (/email not confirmed/i.test(msg)) return 'Confirme d’abord ton e-mail (regarde aussi dans les spams).';
  if (/already registered/i.test(msg)) return 'Ce compte existe déjà : connecte-toi.';
  if (/password/i.test(msg)) return 'Mot de passe trop court (6 caractères minimum).';
  return msg;
}
