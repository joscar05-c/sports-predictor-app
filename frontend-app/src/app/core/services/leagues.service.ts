import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { League, LeagueWithSeasons, Season } from '../models';

@Injectable({ providedIn: 'root' })
export class LeaguesService {
  private sb = inject(SupabaseService);

  private leaguesSignal = signal<League[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly leagues = this.leaguesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly popularLeagues = computed(() => {
    const popularIds = [140, 135, 2, 3, 848, 87, 61, 78, 144, 169];
    return this.leaguesSignal().filter((l) => popularIds.includes(l.api_id));
  });

  constructor() {}

  /** Load all leagues */
  async loadLeagues(): Promise<League[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const { data, error } = await this.sb
        .from('leagues')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      this.leaguesSignal.set((data ?? []) as League[]);
      return data as League[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading leagues';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Get a single league by API id */
  async getLeagueByApiId(apiId: number): Promise<League | null> {
    const { data, error } = await this.sb
      .from('leagues')
      .select('*')
      .eq('api_id', apiId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as League) ?? null;
  }

  /** Get a league with its seasons */
  async getLeagueWithSeasons(leagueDbId: number): Promise<LeagueWithSeasons | null> {
    const { data, error } = await this.sb
      .from('leagues')
      .select('*, seasons(*)')
      .eq('id', leagueDbId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as LeagueWithSeasons) ?? null;
  }

  /** Get seasons for a league */
  async getSeasons(leagueDbId: number): Promise<Season[]> {
    const { data, error } = await this.sb
      .from('seasons')
      .select('*')
      .eq('league_id', leagueDbId)
      .order('year', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Season[];
  }

  /** Get the current season for a league */
  async getCurrentSeason(leagueDbId: number): Promise<Season | null> {
    const { data, error } = await this.sb
      .from('seasons')
      .select('*')
      .eq('league_id', leagueDbId)
      .eq('is_current', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Season) ?? null;
  }

  /** Search leagues by name */
  searchLeagues(query: string): League[] {
    const q = query.toLowerCase();
    return this.leaguesSignal().filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.country_name.toLowerCase().includes(q)
    );
  }

  /** Trigger sync of leagues from API-Football */
  async syncFromApi(params?: { country?: string; code?: string }) {
    const { data, error } = await this.sb.invoke('fetch-football-data', {
      body: { endpoint: 'leagues', params: params ?? {} },
    });

    if (error) throw error;
    return data;
  }
}
