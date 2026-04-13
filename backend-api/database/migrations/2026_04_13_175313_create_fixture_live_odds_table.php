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
        Schema::create('fixture_live_odds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->unique()->constrained()->onDelete('cascade');
            //guardamos el objetos odds del endpoint live
            $table->json('live_odds_data'); //ejemplo: {"bookmaker_id":1,"bets":[{"bet_name":"1X2","bets":[{"option":"Home","odd":1.5},{"option":"Draw","odd":3.5},{"option":"Away","odd":5.0}]}]}
            $table->integer('elapsed_time')->nullable(); //minuto del partido
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_live_odds');
    }
};
