<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    protected $fillable = [
        'api_id',
        'name',
        'type',
        'logo',
        'country_name',
        'country_code',
        'country_flag',
    ];
    /**
     * Casts para asegurar que el ID de la API se trate como un entero largo.
     */
    protected function casts(): array
    {
        return [
            'api_id' => 'integer',
        ];
    }

    /* --- RELACIONES --- */

    /**
     * Una liga tiene muchas temporadas asociadas.
     */
    public function seasons(): HasMany
    {
        return $this->hasMany(Season::class);
    }

    /**
     * Una liga tiene muchos equipos registrados en ella.
     */
    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    /**
     * Una liga tiene muchos partidos (fixtures).
     */
    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }

    /**
     * Una liga tiene sus tablas de posiciones (standings).
     */
    public function standings(): HasMany
    {
        return $this->hasMany(Standing::class);
    }
}
