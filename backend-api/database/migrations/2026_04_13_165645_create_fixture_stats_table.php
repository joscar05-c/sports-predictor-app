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
        Schema::create('fixture_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('team_api_id');

            //estadisticas grupales
            $table->json('team_statistics'); //posesión, tiros, tiros a puerta, faltas, tarjetas, etc

            //estadisticas individuales
            $table->json('player_statistics'); //goles+, asistencias, tarjetas, etc
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_stats');
    }
};
