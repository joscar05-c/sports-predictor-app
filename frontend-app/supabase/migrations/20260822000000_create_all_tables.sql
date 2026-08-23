-- 1. TABLAS CATALOGO
CREATE TABLE IF NOT EXISTS bet_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmakers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ESTRUCTURA GEOGRAFICA
CREATE TABLE IF NOT EXISTS leagues (
    id BIGSERIAL PRIMARY KEY,
    api_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(5),
    country_flag VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venues (
    id BIGSERIAL PRIMARY KEY,
    api_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255),
    capacity INT,
    surface VARCHAR(255),
    image VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    api_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(5),
    country VARCHAR(255) NOT NULL,
    founded VARCHAR(255),
    is_national BOOLEAN DEFAULT FALSE,
    logo VARCHAR(255) NOT NULL,
    venue_id BIGINT REFERENCES venues(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seasons (
    id BIGSERIAL PRIMARY KEY,
    league_id BIGINT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    year INT NOT NULL,
    start DATE NOT NULL,
    "end" DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    coverage JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT seasons_league_id_year_unique UNIQUE (league_id, year)
);

CREATE TABLE IF NOT EXISTS standings (
    id BIGSERIAL PRIMARY KEY,
    league_id BIGINT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_api_id BIGINT NOT NULL,
    season INT NOT NULL,
    rank INT NOT NULL,
    points INT NOT NULL,
    goals_diff INT NOT NULL,
    "group" VARCHAR(255),
    form VARCHAR(10),
    status VARCHAR(255),
    description VARCHAR(255),
    stats_detail JSONB NOT NULL,
    api_updated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT team_standing_unique UNIQUE (league_id, team_api_id, season, "group")
);

CREATE TABLE IF NOT EXISTS team_stats (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    league_id BIGINT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    season_year INT NOT NULL,
    form VARCHAR(255),
    fixtures_played INT NOT NULL DEFAULT 0,
    fixtures_wins INT NOT NULL DEFAULT 0,
    fixtures_draws INT NOT NULL DEFAULT 0,
    fixtures_loses INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    clean_sheets INT NOT NULL DEFAULT 0,
    all_stats JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT team_stats_unique UNIQUE (team_id, league_id, season_year)
);

-- 3. PARTIDOS Y EVENTOS
CREATE TABLE IF NOT EXISTS fixtures (
    id BIGSERIAL PRIMARY KEY,
    api_id BIGINT UNIQUE NOT NULL,
    league_id BIGINT NOT NULL REFERENCES leagues(id),
    season INT NOT NULL,
    round VARCHAR(255) NOT NULL,
    referee VARCHAR(255),
    date TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL,
    status_short VARCHAR(5) NOT NULL,
    status_long VARCHAR(255) NOT NULL,
    elapsed INT,
    home_team_api_id BIGINT NOT NULL,
    away_team_api_id BIGINT NOT NULL,
    goals_home INT,
    goals_away INT,
    score_details JSONB,
    venue_id BIGINT REFERENCES venues(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixture_events (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    team_api_id BIGINT NOT NULL,
    elapsed INT NOT NULL,
    extra INT,
    type VARCHAR(255) NOT NULL,
    detail VARCHAR(255) NOT NULL,
    player_api_id BIGINT,
    player_name VARCHAR(255),
    assist_api_id BIGINT,
    assist_name VARCHAR(255),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixture_lineups (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    team_api_id BIGINT NOT NULL,
    formation VARCHAR(255) NOT NULL,
    start_xi JSONB NOT NULL,
    substitutes JSONB NOT NULL,
    coach JSONB NOT NULL,
    colors JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixture_stats (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    team_api_id BIGINT NOT NULL,
    team_statistics JSONB NOT NULL,
    player_statistics JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PREDICCIONES Y CUOTAS
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT UNIQUE NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    winner_team_api_id BIGINT,
    winner_comment VARCHAR(255),
    win_or_draw BOOLEAN NOT NULL DEFAULT FALSE,
    under_over VARCHAR(255),
    goals_home VARCHAR(255),
    goals_away VARCHAR(255),
    advice TEXT,
    percent_home VARCHAR(10),
    percent_draw VARCHAR(10),
    percent_away VARCHAR(10),
    comparison_stats JSONB NOT NULL,
    teams_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixture_odds (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    bookmaker_id BIGINT NOT NULL REFERENCES bookmakers(id),
    odds_data JSONB NOT NULL,
    api_updated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fixture_odds_unique UNIQUE (fixture_id, bookmaker_id)
);

CREATE TABLE IF NOT EXISTS fixture_live_odds (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT UNIQUE NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    live_odds_data JSONB NOT NULL,
    elapsed_time INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('CREATE POLICY "Public read access" ON %I FOR SELECT USING (true);', tbl);
    END LOOP;
END $$;
