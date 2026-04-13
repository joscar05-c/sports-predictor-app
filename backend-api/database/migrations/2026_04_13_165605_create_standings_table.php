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
        Schema::create('standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('team_api_id');
            $table->integer('season');

            $table->integer('rank');
            $table->integer('points');
            $table->integer('goals_diff');
            $table->string('group')->nullable(); //para torneos con grupos
            $table->string('form', 10)->nullable(); //WDLWWD
            $table->string('status')->nullable(); //promoted, relegated, etc.
            $table->string('description')->nullable(); //cualquier info adicional

            //guardamos los objetos all, home y away como json para tener toda la info disponible
            $table->json('stats_detail'); //todos los detalles de victorias, empates, derrotas, goles a favor, goles en contra, etc.

            $table->dateTime('api_updated_at'); //para saber cuándo se actualizó por última vez esta info desde la api

            $table->timestamps();

            //un equipo solo puede tener una posición en la tabla por temporada, liga y grupo
            $table->unique(['league_id', 'team_api_id', 'season', 'group'], 'team_standing_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standings');
    }
};
