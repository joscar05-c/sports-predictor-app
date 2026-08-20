import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Ejemplo: Obtener partidos con información de la liga asociada
  async getFixtures() {
    const { data, error } = await this.supabase
      .from('fixtures')
      .select(`
        *,
        league:leagues(*),
        venue:venues(*)
      `)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Ejemplo: Obtener alineación de un partido
  async getFixtureLineup(fixtureId: number) {
    const { data, error } = await this.supabase
      .from('fixture_lineups')
      .select('*')
      .eq('fixture_id', fixtureId);

    if (error) throw error;
    return data;
  }
}
