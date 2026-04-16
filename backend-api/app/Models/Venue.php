<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    protected $fillable = [
        'api_id',
        'name',
        'address',
        'city',
        'capacity',
        'surface',
        'image',
    ];

    /**
     * Casts para asegurar que los tipos de datos sean consistentes.
     */
    protected function casts(): array
    {
        return [
            'api_id' => 'integer',
            'capacity' => 'integer',
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Un estadio puede ser la sede de muchos equipos (especialmente en ligas compartidas).
     */
    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    /**
     * Un estadio alberga muchos partidos (fixtures).
     */
    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }
}
