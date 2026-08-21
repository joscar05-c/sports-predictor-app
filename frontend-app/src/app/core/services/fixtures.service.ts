import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  Fixture,
  FixtureWithRelations,
  FixtureDetail,
  FixtureEvent,
  FixtureLineup,
  FixtureStat,
  FixtureStatus,
} from '../models';

@Injectable({ providedIn: 'root' })
export class FixturesService {
  private sb = inject(SupabaseService);

  private fixturesSignal = signal<FixtureWithRelations[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly fixtures = this.fixturesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly liveFixtures = computed(() =>
    this.fixturesSignal().filter((f) => this.isLive(f.status_short))
  );

  readonly upcomingFixtures = computed(() =>
    this.fixturesSignal().filter((f) => f.status_short === 'NS')
  );

  readonly finishedFixtures = computed(() =>
    this.fixturesSignal().filter((f) => ['FT', 'AET', 'PEN'].includes(f.status_short))
  );

  /** Fetch upcoming or in-play fixtures, optionally filtered by league */
  async loadFixtures(options?: { leagueId?: number; season?: number; limit?: number }) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      let query = this.sb
        .from('fixtures')
        .select('*, league:leagues(*), venue:venues(*)')
        .order('date', { ascending: true });

      if (options?.leagueId) {
        query = query.eq('league_id', options.leagueId);
      }
      if (options?.season) {
        query = query.eq('season', options.season);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      this.fixturesSignal.set((data ?? []) as FixtureWithRelations[]);
      return data as FixtureWithRelations[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading fixtures';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Fetch a single fixture with all related data */
  async getFixtureDetail(fixtureApiId: number): Promise<FixtureDetail | null> {
    const { data, error } = await this.sb
      .from('fixtures')
      .select(`
        *,
        league:leagues(*),
        venue:venues(*),
        prediction:predictions(*),
        events:fixture_events(*),
        lineups:fixture_lineups(*),
        statistics:fixture_stats(*)
      `)
      .eq('api_id', fixtureApiId)
      .single();

    if (error) throw error;
    return data as FixtureDetail;
  }

  /** Fetch events for a fixture */
  async getFixtureEvents(fixtureDbId: number): Promise<FixtureEvent[]> {
    const { data, error } = await this.sb
      .from('fixture_events')
      .select('*')
      .eq('fixture_id', fixtureDbId)
      .order('elapsed', { ascending: true });

    if (error) throw error;
    return (data ?? []) as FixtureEvent[];
  }

  /** Fetch lineups for a fixture */
  async getFixtureLineups(fixtureDbId: number): Promise<FixtureLineup[]> {
    const { data, error } = await this.sb
      .from('fixture_lineups')
      .select('*')
      .eq('fixture_id', fixtureDbId);

    if (error) throw error;
    return (data ?? []) as FixtureLineup[];
  }

  /** Fetch statistics for a fixture */
  async getFixtureStats(fixtureDbId: number): Promise<FixtureStat[]> {
    const { data, error } = await this.sb
      .from('fixture_stats')
      .select('*')
      .eq('fixture_id', fixtureDbId);

    if (error) throw error;
    return (data ?? []) as FixtureStat[];
  }

  /** Trigger a sync of fixtures from API-Football via Edge Function */
  async syncFromApi(params: { league: number; season: number; next?: number; id?: number }) {
    const { data, error } = await this.sb.invoke('fetch-football-data', {
      body: { endpoint: 'fixtures', params },
    });

    if (error) throw error;
    return data;
  }

  /** Check if a fixture status means it's currently being played */
  isLive(status: FixtureStatus): boolean {
    return ['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'].includes(status);
  }

  /** Check if a fixture is finished */
  isFinished(status: FixtureStatus): boolean {
    return ['FT', 'AET', 'PEN'].includes(status);
  }
}
