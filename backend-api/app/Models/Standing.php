<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    protected $casts = [
        'stats_detail' => 'array',
        'api_updated_at' => 'datetime',
    ];
}
