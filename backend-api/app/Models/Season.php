<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Season extends Model
{
    protected $fillable = [
        'league_id',
        'year',
        'start',
        'end',
        'is_current',
        'coverage',
    ];

    /**
     * Casts de Laravel 12 para fechas, booleanos y el objeto JSON de cobertura.
     */
    protected function casts(): array
    {
        return [
            'year'       => 'integer',
            'start'      => 'date',
            'end'        => 'date',
            'is_current' => 'boolean',
            'coverage'   => 'array', // Aquí viene la magia para el frontend
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Una temporada pertenece a una liga.
     */
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    /**
     * Una temporada tiene muchos partidos (fixtures).
     */
    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }
}
