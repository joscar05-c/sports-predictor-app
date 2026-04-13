<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixtureStat extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_api_id',
        'team_statistics',
        'player_statistics',
    ];

    protected $casts = [
        'team_statistics' => 'array',
        'player_statistics' => 'array',
    ];

    public function fixture() {
        return $this->belongsTo(Fixture::class);
    }
}
