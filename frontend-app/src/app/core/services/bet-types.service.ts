import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BetType } from '../models';

interface BetTypeRow {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class BetTypesService {
  private sb = inject(SupabaseService);

  private betTypesSignal = signal<BetTypeRow[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly betTypes = this.betTypesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {}

  /** Load all bet types */
  async loadBetTypes(): Promise<BetTypeRow[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const { data, error } = await this.sb
        .from('bet_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      this.betTypesSignal.set((data ?? []) as BetTypeRow[]);
      return data as BetTypeRow[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading bet types';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Get a bet type by id */
  async getBetTypeById(id: number): Promise<BetTypeRow | null> {
    const { data, error } = await this.sb
      .from('bet_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as BetTypeRow) ?? null;
  }

  /** Search bet types by name */
  searchBetTypes(query: string): BetTypeRow[] {
    const q = query.toLowerCase();
    return this.betTypesSignal().filter((bt) =>
      bt.name.toLowerCase().includes(q)
    );
  }

  /** Common bet type names as static reference */
  static readonly COMMON_TYPES = {
    MATCH_RESULT: 'Match Result',
    DOUBLE_CHANCE: 'Double Chance',
    OVER_UNDER_25: 'Over/Under 2.5',
    BTTS: 'Both Teams To Score',
    CORRECT_SCORE: 'Correct Score',
    HALFTIME_FULLTIME: 'Half-Time/Full-Time',
    FIRST_GOAL_SCORER: 'First Goal Scorer',
    HANDICAP: 'Handicap',
    DRAW_NO_BET: 'Draw No Bet',
  } as const;
}
