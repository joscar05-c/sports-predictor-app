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
        Schema::create('fixture_odds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->foreignId('bookmaker_id')->constrained();
            //guaradmos el array bets completo del json
            //ejemplo: [{"bet_name":"1X2","bets":[{"option":"Home","odd":1.5},{"option":"Draw","odd":3.5},{"option":"Away","odd":5.0}]}]
            $table->json('odds_data');

            $table->dateTime('api_updated_at'); //fecha de actualización de las cuotas en la api
            $table->timestamps();

            $table->unique(['fixture_id', 'bookmaker_id']); //un solo registro por combinación fixture-bookmaker
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_odds');
    }
};
