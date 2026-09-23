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
        Schema::create('activite_payants', function (Blueprint $table) {
            $table->id('idActP');
            $table->string('nomActP');
            $table->text('descriptionP')->nullable();
            $table->string('lieuP');
            $table->string('regionP');
            $table->string('entreprise_id')->nullable(); // Rendre le champ nullable
            $table->string('prixP')->nullable();
            $table->float('heure')->nullable(); // Ajouter la colonne heure (float, nullable)
            $table->integer('minute')->nullable(); // Ajouter la colonne minute (int, nullable)
            $table->integer('jours')->nullable(); // Ajouter la colonne jours (int, nullable)
        
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); 
            $table->string('offreP')->nullable();
            $table->unsignedBigInteger('categorie_id');
            $table->foreign('categorie_id')->references('id')->on('categories')->onDelete('cascade');
            $table->timestamps();

       });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activite_payants');
    }
};
