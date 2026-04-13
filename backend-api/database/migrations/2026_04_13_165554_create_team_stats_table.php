<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('team_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->onDelete('cascade');
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->integer('season_year'); //2010, 2011, etc.

            //columnas rápidas para el dashboard (filtros y rankings)
            $table->string('form')->nullable(); //WDLWL
            $table->integer('fixtures_played')->default(0);
            $table->integer('fixtures_wins')->default(0);
            $table->integer('fixtures_draws')->default(0);
            $table->integer('fixtures_loses')->default(0);
            $table->integer('goals_for')->default(0);
            $table->integer('goals_against')->default(0);
            $table->integer('clean_sheets')->default(0);

            // el cajon de sastre para datos profundos (minutos, tarjetas, lineups)
            //aquie meteremos todo el objeto response del json de estadísticas
            $table->json('all_stats')->nullable();

            $table->timestamps();

            //un equipo solo puede tener una fila de estadísticas por temporada y liga
            $table->unique(['team_id', 'league_id', 'season_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_stats');
    }
};
