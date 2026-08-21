import { createClient } from "@supabase/supabase-js";

const API_BASE = "https://v3.football.api-sports.io";

const ALLOWED_ENDPOINTS = [
  "leagues",
  "fixtures",
  "predictions",
  "standings",
  "odds",
  "teams",
] as const;

type Endpoint = (typeof ALLOWED_ENDPOINTS)[number];

interface RequestBody {
  endpoint: Endpoint;
  params: Record<string, string | number>;
}

// ──────────────────────────────────────────────
// CORS
// ──────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function handleCORS(): Response {
  return new Response("ok", {
    headers: corsHeaders,
  });
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function errorResponse(message: string, status = 400): Response {
  return Response.json(
    { success: false, error: message },
    { status, headers: corsHeaders }
  );
}

function successResponse(data: Record<string, unknown>): Response {
  return Response.json(
    { success: true, ...data },
    { headers: corsHeaders }
  );
}

// ──────────────────────────────────────────────
// API-Football Client
// ──────────────────────────────────────────────
async function callFootballApi(
  endpoint: string,
  params: Record<string, string | number>
) {
  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY not configured");
  }

  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const url = `${API_BASE}/${endpoint}?${qs}`;
  console.log(`[API-Football] GET ${url}`);

  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API-Football error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json;
}

// ──────────────────────────────────────────────
// UPSERT: Leagues + Seasons
// ──────────────────────────────────────────────
async function upsertLeagues(
  supabase: ReturnType<typeof createClient>,
  apiData: Record<string, unknown>
) {
  const response = apiData.response as Array<{
    league: {
      id: number;
      name: string;
      type: string;
      logo: string;
      country: { name: string; code: string; flag: string };
    };
    seasons: Array<{
      year: number;
      start: string;
      end: string;
      current: boolean;
      coverage: Record<string, unknown>;
    }>;
  }>;

  let inserted = 0;
  let updated = 0;

  for (const item of response) {
    const l = item.league;
    const country = l.country ?? {};

    const { data: existing } = await supabase
      .from("leagues")
      .select("id")
      .eq("api_id", l.id)
      .single();

    if (existing) {
      await supabase
        .from("leagues")
        .update({
          name: l.name,
          type: l.type,
          logo: l.logo,
          country_name: country.name,
          country_code: country.code,
          country_flag: country.flag,
        })
        .eq("api_id", l.id);
      updated++;
    } else {
      await supabase.from("leagues").insert({
        api_id: l.id,
        name: l.name,
        type: l.type,
        logo: l.logo,
        country_name: country.name,
        country_code: country.code,
        country_flag: country.flag,
      });
      inserted++;
    }

    // Upsert seasons for this league
    const { data: leagueRow } = await supabase
      .from("leagues")
      .select("id")
      .eq("api_id", l.id)
      .single();

    if (leagueRow && item.seasons) {
      for (const s of item.seasons) {
        await supabase.from("seasons").upsert(
          {
            league_id: leagueRow.id,
            year: s.year,
            start: s.start,
            end: s.end,
            is_current: s.current,
            coverage: s.coverage,
          },
          { onConflict: "league_id,year" }
        );
      }
    }
  }

  return { inserted, updated, total: response.length };
}

// ──────────────────────────────────────────────
// UPSERT: Teams + Team Stats
// ──────────────────────────────────────────────
async function upsertTeams(
  supabase: ReturnType<typeof createClient>,
  apiData: Record<string, unknown>
) {
  const response = apiData.response as Array<{
    team: {
      id: number;
      name: string;
      code: string;
      country: string;
      founded: number;
      national: boolean;
      logo: string;
      venue?: {
        id: number;
        name: string;
        address: string;
        city: string;
        capacity: number;
        surface: string;
        image: string;
      };
    };
    statistics?: Record<string, unknown>;
  }>;

  let inserted = 0;
  let updated = 0;

  for (const item of response) {
    const t = item.team;

    // Upsert venue if present
    let venueId: number | null = null;
    if (t.venue) {
      const v = t.venue;
      const { data: existingVenue } = await supabase
        .from("venues")
        .select("id")
        .eq("api_id", v.id)
        .single();

      if (!existingVenue) {
        const { data: newVenue } = await supabase
          .from("venues")
          .insert({
            api_id: v.id,
            name: v.name,
            address: v.address,
            city: v.city,
            capacity: v.capacity,
            surface: v.surface,
            image: v.image,
          })
          .select("id")
          .single();
        venueId = newVenue?.id ?? null;
      } else {
        venueId = existingVenue.id;
        await supabase
          .from("venues")
          .update({
            name: v.name,
            address: v.address,
            city: v.city,
            capacity: v.capacity,
            surface: v.surface,
            image: v.image,
          })
          .eq("api_id", v.id);
      }
    }

    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("api_id", t.id)
      .single();

    if (existing) {
      await supabase
        .from("teams")
        .update({
          name: t.name,
          code: t.code,
          country: t.country,
          founded: String(t.founded ?? ""),
          is_national: t.national ?? false,
          logo: t.logo,
          venue_id: venueId,
        })
        .eq("api_id", t.id);
      updated++;
    } else {
      await supabase.from("teams").insert({
        api_id: t.id,
        name: t.name,
        code: t.code,
        country: t.country,
        founded: String(t.founded ?? ""),
        is_national: t.national ?? false,
        logo: t.logo,
        venue_id: venueId,
      });
      inserted++;
    }
  }

  return { inserted, updated, total: response.length };
}

// ──────────────────────────────────────────────
// UPSERT: Fixtures (basic or detailed)
// ──────────────────────────────────────────────
async function upsertFixtures(
  supabase: ReturnType<typeof createClient>,
  apiData: Record<string, unknown>,
  detailed = false
) {
  const response = apiData.response as Array<{
    fixture: {
      id: number;
      referee: string;
      timezone: string;
      date: string;
      timestamp: number;
      status: {
        short: string;
        long: string;
        elapsed: number | null;
      };
      venue: { id: number | null };
      league: { id: number; season: number; round: string };
    };
    teams: {
      home: { id: number; name: string; logo: string; winner: boolean };
      away: { id: number; name: string; logo: string; winner: boolean };
    };
    goals: { home: number | null; away: number | null };
    score: Record<string, unknown>;
    events?: Array<{
      time: { elapsed: number; extra: number | null };
      team: { id: number };
      player: { id: number; name: string };
      assist: { id: number | null; name: string | null };
      type: string;
      detail: string;
      comments: string | null;
    }>;
    lineups?: Array<{
      team: { id: number };
      formation: string;
      startXI: Array<{ player: Record<string, unknown> }>;
      substitutes: Array<{ player: Record<string, unknown> }>;
      coach: Record<string, unknown>;
      colors: Record<string, unknown>;
    }>;
    statistics?: Array<{
      team: { id: number };
      statistics: Array<{ type: string; value: string | number | null }>;
    }>;
  }>;

  let inserted = 0;
  let updated = 0;

  for (const item of response) {
    const f = item.fixture;

    const { data: existing } = await supabase
      .from("fixtures")
      .select("id")
      .eq("api_id", f.id)
      .single();

    const leagueId = await getLeagueId(supabase, f.league.id);
    if (!leagueId) {
      console.warn(`[fixtures] Skipping fixture ${f.id}: league ${f.league.id} not found`);
      continue;
    }

    const fixtureRow = {
      api_id: f.id,
      league_id: leagueId,
      season: f.league.season,
      round: f.league.round,
      referee: f.referee || null,
      date: f.date,
      timezone: f.timezone,
      timestamp: f.timestamp,
      status_short: f.status.short,
      status_long: f.status.long,
      elapsed: f.status.elapsed,
      home_team_api_id: item.teams.home.id,
      away_team_api_id: item.teams.away.id,
      goals_home: item.goals.home,
      goals_away: item.goals.away,
      score_details: item.score,
      venue_id: f.venue?.id
        ? await getVenueId(supabase, f.venue.id)
        : null,
    };

    if (existing) {
      await supabase
        .from("fixtures")
        .update(fixtureRow)
        .eq("api_id", f.id);
      updated++;
    } else {
      await supabase.from("fixtures").insert(fixtureRow);
      inserted++;
    }

    // Detailed sub-tables
    if (detailed) {
      const { data: fixtureDb } = await supabase
        .from("fixtures")
        .select("id")
        .eq("api_id", f.id)
        .single();

      if (fixtureDb) {
        // Events
        if (item.events?.length) {
          await supabase
            .from("fixture_events")
            .delete()
            .eq("fixture_id", fixtureDb.id);

          const events = item.events.map((e) => ({
            fixture_id: fixtureDb.id,
            team_api_id: e.team.id,
            elapsed: e.time.elapsed,
            extra: e.time.extra,
            type: e.type,
            detail: e.detail,
            player_api_id: e.player.id,
            player_name: e.player.name,
            assist_api_id: e.assist?.id ?? null,
            assist_name: e.assist?.name ?? null,
            comments: e.comments,
          }));

          await supabase.from("fixture_events").insert(events);
        }

        // Lineups
        if (item.lineups?.length) {
          await supabase
            .from("fixture_lineups")
            .delete()
            .eq("fixture_id", fixtureDb.id);

          const lineups = item.lineups.map((l) => ({
            fixture_id: fixtureDb.id,
            team_api_id: l.team.id,
            formation: l.formation,
            start_xi: l.startXI,
            substitutes: l.substitutes,
            coach: l.coach,
            colors: l.colors,
          }));

          await supabase.from("fixture_lineups").insert(lineups);
        }

        // Statistics
        if (item.statistics?.length) {
          await supabase
            .from("fixture_stats")
            .delete()
            .eq("fixture_id", fixtureDb.id);

          const stats = item.statistics.map((s) => ({
            fixture_id: fixtureDb.id,
            team_api_id: s.team.id,
            team_statistics: s.statistics,
            player_statistics: [],
          }));

          await supabase.from("fixture_stats").insert(stats);
        }
      }
    }
  }

  return { inserted, updated, total: response.length };
}

// ──────────────────────────────────────────────
// UPSERT: Standings
// ──────────────────────────────────────────────
async function upsertStandings(
  supabase: ReturnType<typeof createClient>,
  apiData: Record<string, unknown>
) {
  const response = apiData.response as Array<{
    league: {
      id: number;
      season: number;
      standings: Array<
        Array<{
          rank: number;
          team: { id: number; name: string; logo: string };
          points: number;
          goalsDiff: number;
          group: string;
          form: string;
          status: string;
          description: string;
          all: Record<string, unknown>;
          home: Record<string, unknown>;
          away: Record<string, unknown>;
          update: string;
        }>
      >;
    };
  }>;

  let inserted = 0;
  let updated = 0;

  for (const item of response) {
    const leagueId = await getLeagueId(supabase, item.league.id);
    if (!leagueId) continue;

    for (const group of item.league.standings) {
      for (const s of group) {
        const statsDetail = {
          all: s.all,
          home: s.home,
          away: s.away,
        };

        const { data: existing } = await supabase
          .from("standings")
          .select("id")
          .eq("league_id", leagueId)
          .eq("team_api_id", s.team.id)
          .eq("season", item.league.season)
          .eq('"group"', s.group || "")
          .single();

        const standingRow = {
          league_id: leagueId,
          team_api_id: s.team.id,
          season: item.league.season,
          rank: s.rank,
          points: s.points,
          goals_diff: s.goalsDiff,
          group: s.group || null,
          form: s.form,
          status: s.status,
          description: s.description,
          stats_detail: statsDetail,
          api_updated_at: s.update,
        };

        if (existing) {
          await supabase
            .from("standings")
            .update(standingRow)
            .eq("id", existing.id);
          updated++;
        } else {
          await supabase.from("standings").insert(standingRow);
          inserted++;
        }
      }
    }
  }

  return { inserted, updated };
}

// ──────────────────────────────────────────────
// UPSERT: Predictions
// ──────────────────────────────────────────────
async function upsertPredictions(
  supabase: ReturnType<typeof createClient>,
  apiData: Record<string, unknown>
) {
  const response = apiData.response as Array<{
    fixture: { id: number };
    predictions: {
      winner: { id: number | null; name: string; comment: string };
      win_or_draw: boolean;
      under_over: string;
      goals: { home: string; away: string };
      advice: string;
      percent: { home: string; draw: string; away: string };
    };
    comparison: Record<string, unknown>;
    teams: Record<string, unknown>;
  }>;

  let inserted = 0;
  let updated = 0;

  for (const item of response) {
    const fixtureId = await getFixtureId(supabase, item.fixture.id);
    if (!fixtureId) continue;

    const pred = item.predictions;

    const predRow = {
      fixture_id: fixtureId,
      winner_team_api_id: pred.winner?.id ?? null,
      winner_comment: pred.winner?.comment ?? null,
      win_or_draw: pred.win_or_draw ?? false,
      under_over: pred.under_over ?? null,
      goals_home: pred.goals?.home ?? null,
      goals_away: pred.goals?.away ?? null,
      advice: pred.advice ?? null,
      percent_home: pred.percent?.home ?? null,
      percent_draw: pred.percent?.draw ?? null,
      percent_away: pred.percent?.away ?? null,
      comparison_stats: item.comparison ?? {},
      teams_analysis: item.teams ?? null,
    };

    const { data: existing } = await supabase
      .from("predictions")
      .select("id")
      .eq("fixture_id", fixtureId)
      .single();

    if (existing) {
      await supabase
        .from("predictions")
        .update(predRow)
        .eq("id", existing.id);
      updated++;
    } else {
      await supabase.from("predictions").insert(predRow);
      inserted++;
    }
  }

  return { inserted, updated, total: response.length };
}

// ──────────────────────────────────────────────
// UPSERT: Odds + Bookmakers
// ──────────────────────────────────────────────
async function upsertOdds(
  supabase: ReturnType<typeof createClient>,
  apiData: Record<string, unknown>
) {
  const response = apiData.response as Array<{
    fixture: { id: number };
    update: string;
    bookmakers: Array<{
      id: number;
      name: string;
      bets: Array<{
        id: number;
        name: string;
        values: Array<{ value: string; odd: string }>;
      }>;
    }>;
  }>;

  let inserted = 0;
  let updated = 0;

  for (const item of response) {
    const fixtureId = await getFixtureId(supabase, item.fixture.id);
    if (!fixtureId) continue;

    for (const bm of item.bookmakers) {
      // Upsert bookmaker (using name as identifier since no api_id column)
      const { data: existingBm } = await supabase
        .from("bookmakers")
        .select("id")
        .eq("name", bm.name)
        .single();

      let bookmakerDbId: number;
      if (existingBm) {
        bookmakerDbId = existingBm.id;
      } else {
        const { data: newBm } = await supabase
          .from("bookmakers")
          .insert({ name: bm.name })
          .select("id")
          .single();
        bookmakerDbId = newBm!.id;
      }

      // Upsert odds
      const { data: existingOdds } = await supabase
        .from("fixture_odds")
        .select("id")
        .eq("fixture_id", fixtureId)
        .eq("bookmaker_id", bookmakerDbId)
        .single();

      const oddsRow = {
        fixture_id: fixtureId,
        bookmaker_id: bookmakerDbId,
        odds_data: bm.bets,
        api_updated_at: item.update,
      };

      if (existingOdds) {
        await supabase
          .from("fixture_odds")
          .update(oddsRow)
          .eq("id", existingOdds.id);
        updated++;
      } else {
        await supabase.from("fixture_odds").insert(oddsRow);
        inserted++;
      }
    }
  }

  return { inserted, updated, total: response.length };
}

// ──────────────────────────────────────────────
// Lookup helpers
// ──────────────────────────────────────────────
async function getLeagueId(
  supabase: ReturnType<typeof createClient>,
  apiId: number
): Promise<number | null> {
  const { data } = await supabase
    .from("leagues")
    .select("id")
    .eq("api_id", apiId)
    .single();
  return data?.id ?? null;
}

async function getVenueId(
  supabase: ReturnType<typeof createClient>,
  apiId: number
): Promise<number | null> {
  const { data } = await supabase
    .from("venues")
    .select("id")
    .eq("api_id", apiId)
    .single();
  return data?.id ?? null;
}

async function getFixtureId(
  supabase: ReturnType<typeof createClient>,
  apiId: number
): Promise<number | null> {
  const { data } = await supabase
    .from("fixtures")
    .select("id")
    .eq("api_id", apiId)
    .single();
  return data?.id ?? null;
}

// ──────────────────────────────────────────────
// MAIN HANDLER
// ──────────────────────────────────────────────
Deno.serve(async (req): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return handleCORS();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return errorResponse("Method not allowed. Use POST.", 405);
  }

  try {
    // Parse body
    const body: RequestBody = await req.json();
    const { endpoint, params } = body;

    if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
      return errorResponse(
        `Invalid endpoint. Allowed: ${ALLOWED_ENDPOINTS.join(", ")}`
      );
    }

    if (!params || typeof params !== "object") {
      return errorResponse("Missing or invalid 'params' object");
    }

    console.log(`[fetch-football-data] endpoint=${endpoint}`, params);

    // Call API-Football
    const apiData = await callFootballApi(endpoint, params);

    if (apiData.errors && Object.keys(apiData.errors).length > 0) {
      return errorResponse(
        `API-Football returned errors: ${JSON.stringify(apiData.errors)}`,
        422
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Dispatch to correct upsert function
    let result: Record<string, unknown>;

    switch (endpoint) {
      case "leagues":
        result = await upsertLeagues(supabase, apiData);
        break;
      case "teams":
        result = await upsertTeams(supabase, apiData);
        break;
      case "fixtures": {
        const isDetailed = !!params.id;
        result = await upsertFixtures(supabase, apiData, isDetailed);
        break;
      }
      case "standings":
        result = await upsertStandings(supabase, apiData);
        break;
      case "predictions":
        result = await upsertPredictions(supabase, apiData);
        break;
      case "odds":
        result = await upsertOdds(supabase, apiData);
        break;
      default:
        return errorResponse(`Endpoint "${endpoint}" not implemented yet`);
    }

    console.log(`[fetch-football-data] Done:`, result);

    return successResponse({
      endpoint,
      params,
      ...result,
    });
  } catch (err) {
    console.error("[fetch-football-data] Error:", err);
    return errorResponse(err.message || "Internal server error", 500);
  }
});
