<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    protected $casts = [
        'coverage' => 'array', //para que se convierta automáticamente a array al acceder
        'is_current' => 'boolean',
    ];

    public function league()
    {
        return $this->belongsTo(League::class);
    }
}
