export interface Prediction {
  id: number;
  fixture_id: number;
  winner_team_api_id: number | null;
  winner_comment: string | null;
  win_or_draw: boolean;
  under_over: string | null;
  goals_home: string | null;
  goals_away: string | null;
  advice: string | null;
  percent_home: string | null;
  percent_draw: string | null;
  percent_away: string | null;
  comparison_stats: ComparisonStats;
  teams_analysis: TeamsAnalysis | null;
  created_at: string;
  updated_at: string;
}

export interface ComparisonStats {
  form?: { home: string; away: string };
  att?: { home: string; away: string };
  def?: { home: string; away: string };
  poisson_distribution?: { home: string; away: string };
  h2h?: { home: string; away: string };
  goals?: { home: string; away: string };
  total?: { home: string; away: string };
}

export interface TeamsAnalysis {
  home: TeamAnalysis;
  away: TeamAnalysis;
}

export interface TeamAnalysis {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: { total: { home: number; away: number; total: number }; average: { home: number; away: number; total: number } };
    against: { total: { home: number; away: number; total: number }; average: { home: number; away: number; total: number } };
  };
  biggest: {
    wins: { home: string; away: string };
    loses: { home: string; away: string };
    goals: { for: { home: number; away: number }; against: { home: number; away: number } };
  };
  clean_sheet: { home: number; away: number; total: number };
  failed_to_score: { home: number; away: number; total: number };
  penalty: { scored: { total: number; percentage: string }; missed: { total: number; total: number; percentage: string } };
  lineups: Array<{ formation: string; played: number }>;
  cards: {
    yellow: Array<{ minute: string; total: number }>;
    red: Array<{ minute: string; total: number }>;
  };
}

export interface Bookmaker {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FixtureOdd {
  id: number;
  fixture_id: number;
  bookmaker_id: number;
  odds_data: BetType[];
  api_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface BetType {
  id: number;
  name: string;
  values: Array<{ value: string; odd: string }>;
}

export interface FixtureOddWithBookmaker extends FixtureOdd {
  bookmaker: Bookmaker;
}

export interface FixtureLiveOdd {
  id: number;
  fixture_id: number;
  live_odds_data: Record<string, unknown>;
  elapsed_time: number | null;
  created_at: string;
  updated_at: string;
}
