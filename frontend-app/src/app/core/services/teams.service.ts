import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Team, TeamStats, Venue } from '../models';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private sb = inject(SupabaseService);

  private teamsSignal = signal<Team[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly teams = this.teamsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {}

  /** Load teams, optionally filtered by league */
  async loadTeams(options?: { leagueId?: number; season?: number }): Promise<Team[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      let query = this.sb
        .from('teams')
        .select('*')
        .order('name', { ascending: true });

      if (options?.leagueId) {
        // Join through fixtures to find teams in a league
        const { data: fixtures } = await this.sb
          .from('fixtures')
          .select('home_team_api_id, away_team_api_id')
          .eq('league_id', options.leagueId)
          .limit(100);

        if (fixtures?.length) {
          const apiIds = [
            ...new Set([
              ...fixtures.map((f) => f.home_team_api_id),
              ...fixtures.map((f) => f.away_team_api_id),
            ]),
          ];
          query = query.in('api_id', apiIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      this.teamsSignal.set((data ?? []) as Team[]);
      return data as Team[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading teams';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Get a team by API id */
  async getTeamByApiId(apiId: number): Promise<Team | null> {
    const { data, error } = await this.sb
      .from('teams')
      .select('*')
      .eq('api_id', apiId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Team) ?? null;
  }

  /** Get team stats for a specific league and season */
  async getTeamStats(
    teamDbId: number,
    leagueId: number,
    seasonYear: number
  ): Promise<TeamStats | null> {
    const { data, error } = await this.sb
      .from('team_stats')
      .select('*')
      .eq('team_id', teamDbId)
      .eq('league_id', leagueId)
      .eq('season_year', seasonYear)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as TeamStats) ?? null;
  }

  /** Get venue for a team */
  async getTeamVenue(teamDbId: number): Promise<Venue | null> {
    const { data: team } = await this.sb
      .from('teams')
      .select('venue_id')
      .eq('id', teamDbId)
      .single();

    if (!team?.venue_id) return null;

    const { data, error } = await this.sb
      .from('venues')
      .select('*')
      .eq('id', team.venue_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Venue) ?? null;
  }

  /** Search teams by name */
  searchTeams(query: string): Team[] {
    const q = query.toLowerCase();
    return this.teamsSignal().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q)
    );
  }

  /** Trigger sync of teams from API-Football */
  async syncFromApi(leagueApiId: number, season: number) {
    const { data, error } = await this.sb.invoke('fetch-football-data', {
      body: {
        endpoint: 'teams',
        params: { league: leagueApiId, season },
      },
    });

    if (error) throw error;
    return data;
  }
}
