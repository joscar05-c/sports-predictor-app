<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamStat extends Model
{
    protected $fillable = [
        'team_id',
        'league_id',
        'season_year',
        'form',
        'fixtures_played',
        'fixtures_wins',
        'fixtures_draws',
        'fixtures_loses',
        'goals_for',
        'goals_against',
        'clean_sheets',
        'all_stats'
    ];

    /**
     * Casts de Laravel 12 para asegurar tipos numéricos y el manejo del JSON.
     */
    protected function casts(): array
    {
        return [
            'fixtures_played' => 'integer',
            'fixtures_wins'   => 'integer',
            'fixtures_draws'  => 'integer',
            'fixtures_loses'  => 'integer',
            'goals_for'       => 'integer',
            'goals_against'   => 'integer',
            'clean_sheets'    => 'integer',
            'all_stats'       => 'array', // El objeto completo de la API
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Las estadísticas pertenecen a un equipo.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Las estadísticas corresponden a una liga específica.
     */
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }
}
