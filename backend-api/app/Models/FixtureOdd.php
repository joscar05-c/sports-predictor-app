<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureOdd extends Model
{
    protected $fillable = [
        'fixture_id',
        'bookmaker_id',
        'odds_data',
        'api_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'odds_data' => 'array',
            'api_updated_at' => 'datetime',
        ];
    }

    public function fixture(): BelongsTo {
        return $this->belongsTo(Fixture::class);
    }

    public function bookmaker(): BelongsTo {
        return $this->belongsTo(Bookmaker::class);
    }
}
