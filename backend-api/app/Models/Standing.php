<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Standing extends Model
{
    protected $fillable = [
        'team_api_id',
        'league_id',
        'season',
        'rank',
        'points',
        'goals_diff',
        'group',
        'form',
        'status',
        'description',
        'stats_detail',
        'api_updated_at',
    ];

    /**
     * Casts modernos para manejar los detalles estadísticos y fechas de la API.
     */
    protected function casts(): array
    {
        return [
            'season' => 'integer',
            'rank' => 'integer',
            'points' => 'integer',
            'goals_diff' => 'integer',
            'stats_detail' => 'array', // Contiene: all, home, away (played, win, draw, lose, goals...)
            'api_updated_at' => 'datetime',
        ];
    }

    /* --- RELACIONES --- */

    /**
     * La posición pertenece a una liga específica.
     */
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    /**
     * Relación con el equipo usando el ID de la API.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_api_id', 'api_id');
    }
}
