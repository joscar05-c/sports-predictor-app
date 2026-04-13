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
        Schema::create('seasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->integer('year'); // 2010, 2011, etc.
            $table->date('start');
            $table->date('end');
            $table->boolean('is_current')->default(false);

            //guardamos todo el objeto coverage como JSON
            //útil en angular para habilitar/deshabiltgar botones según las coberturas disponibles
            $table->json('coverage')->nullable();

            $table->timestamps();

            //evitamos duplicar la misma temporada para la misma liga
            $table->unique(['league_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seasons');
    }
};
