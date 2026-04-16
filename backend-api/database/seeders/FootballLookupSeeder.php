<?php

namespace Database\Seeders;

use App\Models\BetType;
use App\Models\Bookmaker;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FootballLookupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Casas de apuestas principales
        $bookmakers = [
            ['id' => 1, 'name' => '10Bet'],
            ['id' => 2, 'name' => 'Marathonbet'],
            ['id' => 3, 'name' => 'Betfair'],
            ['id' => 4, 'name' => 'Pinnacle'],
            ['id' => 5, 'name' => 'Sport Betting Online'],
            ['id' => 6, 'name' => 'Bwin'],
            ['id' => 7, 'name' => 'William Hill'],
            ['id' => 8, 'name' => 'Bet365'],
            ['id' => 9, 'name' => 'Dafabet'],
            ['id' => 10, 'name' => 'Ladbrokes'],
            ['id' => 11, 'name' => '1xBet'],
            ['id' => 12, 'name' => 'BetFred'],
            ['id' => 13, 'name' => '188Bet'],
            ['id' => 15, 'name' => 'Interwetten'],
            ['id' => 16, 'name' => 'Unibet'],

        ];

        foreach ($bookmakers as $bm) {
            Bookmaker::updateOrCreate(['id' => $bm['id']], $bm);
        }

        // Tipos de apuestas principales
        $bets = [
            ['id' => 1,  'name' => 'Match Winner'], // El que faltaba en tu búsqueda
            ['id' => 5,  'name' => 'Goals Over/Under'],
            ['id' => 6,  'name' => 'Goals Over/Under First Half'],
            ['id' => 11, 'name' => 'Asian Handicap'],
            ['id' => 12, 'name' => 'Both Teams Score'],
            ['id' => 26, 'name' => 'Goals Over/Under - Second Half'],
            ['id' => 45, 'name' => 'Corners Over Under'],
            ['id' => 57, 'name' => 'Home Corners Over/Under'],
            ['id' => 58, 'name' => 'Away Corners Over/Under'],
            ['id' => 74, 'name' => '10 Over/Under'],
        ];

        foreach ($bets as $bet) {
            BetType::updateOrCreate(['id' => $bet['id']], $bet);
        }
    }
}
