export interface Venue {
  id: number;
  api_id: number;
  name: string;
  address: string | null;
  city: string | null;
  capacity: number | null;
  surface: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  api_id: number;
  name: string;
  code: string | null;
  country: string;
  founded: string | null;
  is_national: boolean;
  logo: string;
  venue_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TeamStats {
  id: number;
  team_id: number;
  league_id: number;
  season_year: number;
  form: string | null;
  fixtures_played: number;
  fixtures_wins: number;
  fixtures_draws: number;
  fixtures_loses: number;
  goals_for: number;
  goals_against: number;
  clean_sheets: number;
  all_stats: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Standing {
  id: number;
  league_id: number;
  team_api_id: number;
  season: number;
  rank: number;
  points: number;
  goals_diff: number;
  group: string | null;
  form: string | null;
  status: string | null;
  description: string | null;
  stats_detail: StandingStatsDetail;
  api_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface StandingStatsDetail {
  all: StandingGroupStats;
  home: StandingGroupStats;
  away: StandingGroupStats;
}

export interface StandingGroupStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

export interface StandingWithTeam extends Standing {
  team: Team;
}
