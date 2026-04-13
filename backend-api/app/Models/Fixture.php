<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Fixture extends Model
{
    protected $fillable = [
        'api_id',
        'league_id',
        'season',
        'round',
        'referee',
        'date',
        'timezone',
        'timestamp',
        'status_short',
        'status_long',
        'elapsed',
        'home_team_api_id',
        'away_team_api_id',
        'goals_home',
        'goals_away',
        'score_details',
        'venue_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'score_details' => 'array',
            'elapsed' => 'integer',
            'timestamp' => 'integer',

        ];
    }
    /* RELACIONES */
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /* RELACION CON EL EQUIPO LOCAL USANDO EL api_id */
    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_api_id', 'api_id');
    }

    /* RELACION CON EL EQUIPO VISITANTE USANDO EL api_id */
    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_api_id', 'api_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(FixtureEvent::class);
    }

    public function statistics(): HasMany
    {
        return $this->hasMany(FixtureStat::class);
    }

    public function lineups(): HasMany
    {
        return $this->hasMany(FixtureLineup::class);
    }

    public function prediction(): HasOne
    {
        return $this->hasOne(Prediction::class);
    }

    public function odds(): HasMany
    {
        return $this->hasMany(FixtureOdd::class);
    }

}
