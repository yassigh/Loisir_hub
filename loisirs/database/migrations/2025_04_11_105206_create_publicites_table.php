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
        Schema::create('publicites', function (Blueprint $table) {
            $table->id();
            $table->string('entreprise_id');
            $table->date('date_debut');
            $table->integer('nbJours');
            $table->decimal('montantAPayer', 8, 2);
            $table->decimal('montantAPayerParJour', 8, 2)->default(1.00); // Ajout du nouveau champ avec valeur par défaut
            $table->enum('statut', ['pending', 'approved', 'rejected'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publicites');
    }
};
