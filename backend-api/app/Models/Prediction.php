<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    protected $fillable = [
        'fixture_id',
        'winner_team_api_id',
        'winner_comment',
        'win_or_draw',
        'under_over',
        'goals_home',
        'goals_away',
        'advice',
        'percent_home',
        'percent_draw',
        'percent_away',
        'comparison_stats',
        'teams_analysis',
    ];

    protected $casts = [
        'win_or_draw' => 'boolean',
        'comparison_stats' => 'array',
        'teams_analysis' => 'array',
    ];
}
