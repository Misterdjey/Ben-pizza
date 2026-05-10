import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

const WHITELIST = ['benyochemla@gmail.com', 'jchemla@gmail.com'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  session = signal<Session | null>(null);
  user = signal<User | null>(null);
  errorMessage = signal<string | null>(null);

  // Resolves once the initial session check (+ OAuth code exchange) is done
  readonly initialized: Promise<void>;
  private resolveInit!: () => void;

  constructor() {
    this.initialized = new Promise((resolve) => {
      this.resolveInit = resolve;
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !WHITELIST.includes(session.user.email ?? '')) {
        this.supabase.auth.signOut();
        this.errorMessage.set('Accès refusé : adresse email non autorisée.');
        this.session.set(null);
        this.user.set(null);
        this.resolveInit();
        this.router.navigate(['/login']);
        return;
      }
      this.session.set(session);
      this.user.set(session?.user ?? null);
      if (session) this.errorMessage.set(null);
      this.resolveInit();
    });

    // Trigger initial session load (handles OAuth code in URL too)
    this.supabase.auth.getSession().then(({ data }) => {
      if (!data.session) this.resolveInit();
    });
  }

  loginWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
  }

  logout() {
    return this.supabase.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  isAuthenticated(): boolean {
    return this.session() !== null;
  }
}
