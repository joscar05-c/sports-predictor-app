<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureLineup extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_api_id',
        'formation',
        'start_xi',
        'substitutes',
        'coach',
        'colors',
    ];

    protected function casts(): array
    {
        return [
            'start_xi' => 'array',
            'substitutes' => 'array',
            'coach' => 'array',
            'colors' => 'array',
        ];
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_api_id', 'api_id');
    }
}
