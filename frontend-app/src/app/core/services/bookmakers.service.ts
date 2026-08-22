import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

interface BookmakerRow {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class BookmakersService {
  private sb = inject(SupabaseService);

  private bookmakersSignal = signal<BookmakerRow[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly bookmakers = this.bookmakersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {}

  /** Load all bookmakers */
  async loadBookmakers(): Promise<BookmakerRow[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const { data, error } = await this.sb
        .from('bookmakers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      this.bookmakersSignal.set((data ?? []) as BookmakerRow[]);
      return data as BookmakerRow[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading bookmakers';
      this.errorSignal.set(msg);
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Get a bookmaker by id */
  async getBookmakerById(id: number): Promise<BookmakerRow | null> {
    const { data, error } = await this.sb
      .from('bookmakers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as BookmakerRow) ?? null;
  }

  /** Search bookmakers by name */
  searchBookmakers(query: string): BookmakerRow[] {
    const q = query.toLowerCase();
    return this.bookmakersSignal().filter((bm) =>
      bm.name.toLowerCase().includes(q)
    );
  }
}
