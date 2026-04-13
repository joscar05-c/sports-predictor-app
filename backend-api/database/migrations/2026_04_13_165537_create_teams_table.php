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
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('api_id')->unique(); //el id del json de la api
            $table->string('name');
            $table->string('code', 5)->nullable(); //MUN, RMA
            $table->string('country');
            $table->string('founded')->nullable();
            $table->boolean('is_national')->default(false);
            $table->string('logo');
            $table->foreignId('venue_id')->nullable()->constrained()->onDelete('set null'); //relación con el estadio
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
