<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prediction extends Model
{
    protected $fillable = [
        'fixture_id',
        'winner_team_api_id',
        'winner_comment',
        'win_or_draw',
        'under_over',
        'goals_home',
        'goals_away',
        'advice',
        'percent_home',
        'percent_draw',
        'percent_away',
        'comparison_stats',
        'teams_analysis',
    ];

    /**
     * Los casts modernos de Laravel 12 para manejar booleanos y JSON.
     */
    protected function casts(): array
    {
        return [
            'win_or_draw' => 'boolean',
            'comparison_stats' => 'array', // Form, attack, defense, etc.
            'teams_analysis' => 'array',   // Snapshot de los equipos
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Una predicción pertenece a un partido específico.
     */
    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    /**
     * El equipo que se predice como ganador.
     * Relacionamos con Team usando el api_id.
     */
    public function winnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_team_api_id', 'api_id');
    }
}
