import { Injectable, signal, inject, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session, AuthError } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = inject(SupabaseService);

  private userSignal = signal<User | null>(null);
  private sessionSignal = signal<Session | null>(null);
  private loadingSignal = signal(true);

  readonly user = this.userSignal.asReadonly();
  readonly session = this.sessionSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly userId = computed(() => this.userSignal()?.id ?? null);
  readonly userEmail = computed(() => this.userSignal()?.email ?? null);

  constructor() {
    this.init();
  }

  /** Initialize auth state listener */
  private async init() {
    const { data: { session } } = await this.sb.auth.getSession();
    this.sessionSignal.set(session);
    this.userSignal.set(session?.user ?? null);
    this.loadingSignal.set(false);

    this.sb.auth.onAuthStateChange((_event, session) => {
      this.sessionSignal.set(session);
      this.userSignal.set(session?.user ?? null);
      this.loadingSignal.set(false);
    });
  }

  /** Sign up with email and password */
  async signUp(email: string, password: string) {
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  /** Sign in with email and password */
  async signIn(email: string, password: string) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  /** Sign in with OAuth provider (google, github, etc.) */
  async signInWithProvider(provider: 'google' | 'github' | 'facebook' | 'twitter') {
    const { data, error } = await this.sb.auth.signInWithOAuth({ provider });
    if (error) throw error;
    return data;
  }

  /** Sign out */
  async signOut() {
    const { error } = await this.sb.auth.signOut();
    if (error) throw error;
  }

  /** Get current session */
  async getSession() {
    const { data, error } = await this.sb.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  /** Refresh current session */
  async refreshSession() {
    const { data, error } = await this.sb.auth.refreshSession();
    if (error) throw error;
    return data;
  }

  /** Update user profile (email, password, metadata) */
  async updateProfile(updates: { email?: string; password?: string; data?: Record<string, unknown> }) {
    const { data, error } = await this.sb.auth.updateUser(updates);
    if (error) throw error;
    return data;
  }

  /** Send password reset email */
  async resetPassword(email: string) {
    const { error } = await this.sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  /** Get user metadata */
  getUserMetadata(): Record<string, unknown> {
    return this.userSignal()?.user_metadata ?? {};
  }
}
