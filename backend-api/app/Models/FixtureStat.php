<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureStat extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_api_id',
        'team_statistics',
        'player_statistics',
    ];

    /**
     * Definición de casts para manejar los datos JSON como arrays de PHP.
     */
    protected function casts(): array
    {
        return [
            'team_statistics'   => 'array',
            'player_statistics' => 'array',
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Relación con el partido.
     */
    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    /**
     * Relación con el equipo usando el ID de la API.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_api_id', 'api_id');
    }
}
