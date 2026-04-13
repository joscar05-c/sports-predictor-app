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
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->unique()->constrained()->onDelete('cascade');

            //el pronostico directo
            $table->unsignedBigInteger('winner_team_api_id')->nullable(); //el equipo que se predice que ganará, null si se predice empate
            $table->string('winner_comment')->nullable(); //comentario sobre la predicción del ganador
            $table->boolean('win_or_draw')->default(false); //si se predice que el equipo ganador ganará o empatara
            $table->string('under_over')->nullable(); //over/under 2.5 goles
            $table->string('goals_home')->nullable(); //predicción de goles del equipo local
            $table->string('goals_away')->nullable(); //predicción de goles del equipo visitante
            $table->text('advice')->nullable(); //consejo para apostar basado en la predicción

            //porcentajes de probabilidad
            $table->string('percent_home', 10)->nullable(); //probabilidad de victoria del equipo local
            $table->string('percent_draw', 10)->nullable(); //probabilidad de empate
            $table->string('percent_away', 10)->nullable(); //probabilidad de victoria del equipo visitante

            //bloque de compracion forma, ataque, defensa, poison, etc
            $table->json('comparison_stats');
            //snapshos delos equipos en las últimas semanas
            //guardamos los objetos home y away de la secicon teams del json
            $table->json('teams_analysis')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
