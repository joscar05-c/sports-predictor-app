<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureLiveOdd extends Model
{
    protected $fillable = [
        'fixture_id',
        'live_odds_data',
        'elapsed_time',
    ];

    protected function casts(): array
    {
        return [
            'live_odds_data' => 'array',
            'elapsed_time' => 'integer',
        ];
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }
}
