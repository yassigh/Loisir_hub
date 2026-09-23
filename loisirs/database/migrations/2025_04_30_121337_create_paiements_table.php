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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id(); // ID unique pour chaque paiement
            $table->unsignedBigInteger('user_id'); // Référence vers l'utilisateur
            $table->unsignedBigInteger('entreprise_id'); // Référence vers l'entreprise
            $table->unsignedBigInteger('reservation_id')->nullable(); // Référence vers une réservation
            $table->unsignedBigInteger('publicite_id')->nullable(); // Référence vers une publicite 
            $table->decimal('montant', 8, 2); // Montant du paiement
            $table->enum('statut', ['en_attente', 'reussi', 'echoue'])->default('en_attente'); // Statut du paiement
            $table->string('transaction_id')->nullable(); // ID de transaction du service de paiement
            $table->string('methode_paiement')->nullable(); // Méthode de paiement (ex: carte, wallet)
            $table->timestamps();
            $table->foreign('reservation_id')->references('id_Res')->on('reservations')->onDelete('cascade');
            $table->foreign('publicite_id')->references('id')->on('publicites')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
