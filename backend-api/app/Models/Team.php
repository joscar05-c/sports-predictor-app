<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Relations\BelongsTo;

class Team extends Model
{
    protected $fillable = [
        'api_id',
        'league_id',
        'name',
        'logo',
        'venue_id',
    ];

    public function league(): BelongsTo {return $this->belongsTo(League::class);}
    public function venue(): BelongsTo {return $this->belongsTo(Venue::class);}
}
