import { League } from './league.model';
import { Team, Venue } from './team.model';

export type FixtureStatus =
  | 'NS'   // Not Started
  | '1H'   // First Half
  | 'HT'   // Half Time
  | '2H'   // Second Half
  | 'ET'   // Extra Time
  | 'P'    // Paused
  | 'FT'   // Full Time
  | 'AET'  // After Extra Time
  | 'PEN'  // Penalty
  | 'BT'   // Break Time
  | 'SUSP' // Suspended
  | 'INT'  // Interrupted
  | 'PST'  // Postponed
  | 'CANC' // Cancelled
  | 'ABD'  // Abandoned
  | 'AWD'  // Awarded
  | 'WO'   // WalkOver
  | 'LIVE'; // Live

export interface Fixture {
  id: number;
  api_id: number;
  league_id: number;
  season: number;
  round: string;
  referee: string | null;
  date: string;
  timezone: string;
  timestamp: number;
  status_short: FixtureStatus;
  status_long: string;
  elapsed: number | null;
  home_team_api_id: number;
  away_team_api_id: number;
  goals_home: number | null;
  goals_away: number | null;
  score_details: ScoreDetails | null;
  venue_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreDetails {
  halftime: { home: number | null; away: number | null };
  fulltime: { home: number | null; away: number | null };
  extratime: { home: number | null; away: number | null };
  penalty: { home: number | null; away: number | null };
}

export interface FixtureEvent {
  id: number;
  fixture_id: number;
  team_api_id: number;
  elapsed: number;
  extra: number | null;
  type: string;
  detail: string;
  player_api_id: number | null;
  player_name: string | null;
  assist_api_id: number | null;
  assist_name: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface FixtureLineup {
  id: number;
  fixture_id: number;
  team_api_id: number;
  formation: string;
  start_xi: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: CoachInfo;
  colors: TeamColors;
  created_at: string;
  updated_at: string;
}

export interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

export interface CoachInfo {
  id: number;
  name: string;
  photo: string | null;
}

export interface TeamColors {
  player: { primary: string; number: string; edge: string; gate: string };
  goalkeeper: { primary: string; number: string; edge: string; gate: string };
}

export interface FixtureStat {
  id: number;
  fixture_id: number;
  team_api_id: number;
  team_statistics: TeamStatistic[];
  player_statistics: PlayerStatistic[];
  created_at: string;
  updated_at: string;
}

export interface TeamStatistic {
  type: string;
  value: string | number | null;
}

export interface PlayerStatistic {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: TeamStatistic[];
}

// ── Enriched types (with joins) ──

export interface FixtureWithRelations extends Fixture {
  league: League;
  venue: Venue | null;
}

export interface FixtureDetail extends FixtureWithRelations {
  home_team: Team;
  away_team: Team;
  prediction: import('./prediction.model').Prediction | null;
  events: FixtureEvent[];
  lineups: FixtureLineup[];
  statistics: FixtureStat[];
}
