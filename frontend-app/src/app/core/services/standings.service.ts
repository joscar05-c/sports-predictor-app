import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Standing, StandingWithTeam } from '../models';

@Injectable({ providedIn: 'root' })
export class StandingsService {
  private sb = inject(SupabaseService);

  private standingsSignal = signal<StandingWithTeam[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly standings = this.standingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /** Load standings for a league and season */
  async loadStandings(leagueId: number, season: number): Promise<StandingWithTeam[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const { data, error } = await this.sb
        .from('standings')
        .select('*, team:teams(*)')
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('rank', { ascending: true });

      if (error) throw error;

      this.standingsSignal.set((data ?? []) as StandingWithTeam[]);
      return data as StandingWithTeam[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading standings';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Get a single team's standing in a league */
  async getTeamStanding(
    leagueId: number,
    teamApiId: number,
    season: number
  ): Promise<StandingWithTeam | null> {
    const { data, error } = await this.sb
      .from('standings')
      .select('*, team:teams(*)')
      .eq('league_id', leagueId)
      .eq('team_api_id', teamApiId)
      .eq('season', season)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as StandingWithTeam) ?? null;
  }

  /** Trigger sync of standings from API-Football */
  async syncFromApi(leagueApiId: number, season: number) {
    const { data, error } = await this.sb.invoke('fetch-football-data', {
      body: {
        endpoint: 'standings',
        params: { league: leagueApiId, season },
      },
    });

    if (error) throw error;
    return data;
  }
}
