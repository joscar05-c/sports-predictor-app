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
        Schema::create('fixtures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('api_id')->unique(); //el id del json de la api
            $table->foreignId('league_id')->constrained();
            $table->integer('season');
            $table->string('round'); // "Regular Season - 1", "Regular Season - 2", etc.
            $table->string('referee')->nullable();
            $table->dateTime('date'); //fixture.data
            $table->string('timezone');
            $table->integer('timestamp');

            //estados : NS, 1H, HT, 2H, ET, P, FT, AET, PEN, BT
            $table->string('status_short', 5);
            $table->string('status_long');
            $table->integer('elapsed')->nullable(); //minutos transcurridos+

            //equipos (relacion con tabla teams)
            $table->unsignedBigInteger('home_team_api_id');
            $table->unsignedBigInteger('away_team_api_id');

            //marcadores rapidos
            $table->integer('goals_home')->nullable();
            $table->integer('goals_away')->nullable();

            //todos los scores (halftime, fulltime, penalty) en un solo json
            $table->json('score_details')->nullable();

            $table->foreignId('venue_id')->nullable()->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixtures');
    }
};
