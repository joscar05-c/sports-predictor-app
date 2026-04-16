<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FootballApiService
{
    protected $baseUrl = 'https://v3.football.api-sports.io';
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.football.key');
    }

    public function getLeagues()
    {
        return Http::withHeaders(['x-apisports-key' => $this->apiKey])
            ->get("{$this->baseUrl}/leagues")
            ->json('response');
    }
}
