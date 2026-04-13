<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureEvent extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_api_id',
        'elapsed',
        'extra',
        'type',
        'detail',
        'player_api_id',
        'player_name',
        'assist_api_id',
        'assist_name',
        'comments',
    ];

    protected function casts(): array
    {
        return [
            'elapsed' => 'integer',
            'extra' => 'integer',
            'fixture_id' => 'integer',
            'team_api_id' => 'integer',
        ];
    }

    public function fixture(): BelongsTo {
        return $this->belongsTo(Fixture::class);
    }

    public function team(): BelongsTo {
        return $this->belongsTo(Team::class, 'team_api_id', 'api_id');
    }
}
