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

    public function seasons()
    {
        return $this->hasMany(Season::class);
    }

    public function teams(): HasMany{ return $this->hasMany(Team::class); }
    public function fixtures(): HasMany{ return $this->hasMany(Fixture::class); }
}
