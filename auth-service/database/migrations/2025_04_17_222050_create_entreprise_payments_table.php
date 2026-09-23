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
        Schema::create('entreprise_payments', function (Blueprint $table) {
            $table->id();
    $table->unsignedBigInteger('entreprise_id'); // Référence vers l'entreprise
    $table->unsignedBigInteger('subscription_id')->nullable();// Référence vers l'abonnement
    $table->unsignedBigInteger('publicite_id')->nullable(); // Ajout publicité
    $table->decimal('montant', 8, 2); // Montant du paiement
    $table->enum('statut', ['en_attente', 'reussi', 'echoue'])->default('en_attente'); // Statut du paiement
    $table->string('transaction_id')->nullable(); // ID de transaction du service de paiement
    $table->string('methode_paiement')->nullable(); // Méthode de paiement (ex: carte, wallet)
    $table->string('type_paiement')->default('subscription'); // 'subscription' ou 'publicite'
    $table->timestamps();

    // Clés étrangères (si les tables existent)
    $table->foreign('entreprise_id')->references('id')->on('entreprises')->onDelete('cascade');
    $table->foreign('subscription_id')->references('id')->on('subscriptions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entreprise_payments');
    }
};
