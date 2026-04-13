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
        Schema::create('fixture_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('team_api_id');
            $table->integer('elapsed');
            $table->integer('extra')->nullable();

            $table->string('type'); //goal, card, substitution
            $table->string('detail'); //yellow card, red card, normal goal, penalty, etc.

            //jugadores involucrados
            $table->unsignedBigInteger('player_api_id')->nullable();
            $table->string('player_name')->nullable();
            $table->unsignedBigInteger('assist_api_id')->nullable();
            $table->string('assist_name')->nullable();

            $table->text('comments')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_events');
    }
};
