<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    protected $fillable = [
        'api_id',
        'name',
        'code',
        'country',
        'founded',
        'is_national',
        'logo',
        'venue_id'
    ];

    /**
     * Casts para asegurar la integridad de tipos en Laravel 12.
     */
    protected function casts(): array
    {
        return [
            'api_id' => 'integer',
            'is_national' => 'boolean',
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Un equipo juega en un estadio (Venue).
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * Relación con los partidos donde juega como local.
     * Usamos el api_id como referencia para el fixture.
     */
    public function homeFixtures(): HasMany
    {
        return $this->hasMany(Fixture::class, 'home_team_api_id', 'api_id');
    }

    /**
     * Relación con los partidos donde juega como visitante.
     */
    public function awayFixtures(): HasMany
    {
        return $this->hasMany(Fixture::class, 'away_team_api_id', 'api_id');
    }

    /**
     * Un equipo tiene registros en las tablas de posiciones (standings).
     */
    public function standings(): HasMany
    {
        return $this->hasMany(Standing::class, 'team_api_id', 'api_id');
    }
}
