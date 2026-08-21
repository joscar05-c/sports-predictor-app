export interface League {
  id: number;
  api_id: number;
  name: string;
  type: string;
  logo: string;
  country_name: string;
  country_code: string | null;
  country_flag: string | null;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: number;
  league_id: number;
  year: number;
  start: string;
  end: string;
  is_current: boolean;
  coverage: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface LeagueWithSeasons extends League {
  seasons: Season[];
}
