import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Venue } from '../models';

@Injectable({ providedIn: 'root' })
export class VenuesService {
  private sb = inject(SupabaseService);

  private venuesSignal = signal<Venue[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly venues = this.venuesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {}

  /** Load all venues */
  async loadVenues(): Promise<Venue[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const { data, error } = await this.sb
        .from('venues')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      this.venuesSignal.set((data ?? []) as Venue[]);
      return data as Venue[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading venues';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Get a venue by API id */
  async getVenueByApiId(apiId: number): Promise<Venue | null> {
    const { data, error } = await this.sb
      .from('venues')
      .select('*')
      .eq('api_id', apiId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Venue) ?? null;
  }

  /** Get a venue by DB id */
  async getVenueById(id: number): Promise<Venue | null> {
    const { data, error } = await this.sb
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Venue) ?? null;
  }

  /** Search venues by name or city */
  searchVenues(query: string): Venue[] {
    const q = query.toLowerCase();
    return this.venuesSignal().filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q)
    );
  }
}
