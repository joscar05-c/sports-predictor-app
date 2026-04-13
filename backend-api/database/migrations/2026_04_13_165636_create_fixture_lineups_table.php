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
        Schema::create('fixture_lineups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('team_api_id');

            $table->string('formation'); //4-3-3, 4-4-2, etc.
            $table->json('start_xi'); //jugadores titulares
            $table->json('substitutes'); //jugadores de reemplazo
            $table->json('coach'); //entrenador
            $table->json('colors'); //colores del equipo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_lineups');
    }
};
