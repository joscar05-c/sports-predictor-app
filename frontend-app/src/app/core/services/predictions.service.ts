import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  Prediction,
  FixtureOddWithBookmaker,
  FixtureLiveOdd,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PredictionsService {
  private sb = inject(SupabaseService);

  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /** Get prediction for a specific fixture (by fixture DB id) */
  async getPrediction(fixtureDbId: number): Promise<Prediction | null> {
    const { data, error } = await this.sb
      .from('predictions')
      .select('*')
      .eq('fixture_id', fixtureDbId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data as Prediction | null;
  }

  /** Get prediction by fixture API id */
  async getPredictionByApiId(fixtureApiId: number): Promise<Prediction | null> {
    // First get the DB id from the api_id
    const { data: fixture } = await this.sb
      .from('fixtures')
      .select('id')
      .eq('api_id', fixtureApiId)
      .single();

    if (!fixture) return null;
    return this.getPrediction(fixture.id);
  }

  /** Get odds for a fixture (with bookmaker info) */
  async getFixtureOdds(fixtureDbId: number): Promise<FixtureOddWithBookmaker[]> {
    const { data, error } = await this.sb
      .from('fixture_odds')
      .select('*, bookmaker:bookmakers(*)')
      .eq('fixture_id', fixtureDbId);

    if (error) throw error;
    return (data ?? []) as FixtureOddWithBookmaker[];
  }

  /** Get live odds for a fixture */
  async getLiveOdds(fixtureDbId: number): Promise<FixtureLiveOdd | null> {
    const { data, error } = await this.sb
      .from('fixture_live_odds')
      .select('*')
      .eq('fixture_id', fixtureDbId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as FixtureLiveOdd | null;
  }

  /** Trigger sync of predictions from API-Football */
  async syncFromApi(fixtureApiId: number) {
    const { data, error } = await this.sb.invoke('fetch-football-data', {
      body: {
        endpoint: 'predictions',
        params: { fixture: fixtureApiId },
      },
    });

    if (error) throw error;
    return data;
  }

  /** Trigger sync of odds from API-Football */
  async syncOddsFromApi(fixtureApiId: number) {
    const { data, error } = await this.sb.invoke('fetch-football-data', {
      body: {
        endpoint: 'odds',
        params: { fixture: fixtureApiId },
      },
    });

    if (error) throw error;
    return data;
  }
}
