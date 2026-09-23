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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id('id_Res');
            $table->unsignedBigInteger('id_Act');
            $table->foreign('id_Act')->references('idActP')->on('activite_payants')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->date('dateCreationReservation');
            $table->date('dateDebut');
            $table->date('dateFin');
            $table->string('num_tel');
            $table->float('montant')->nullable();
            $table->enum('etat', ['accepte', 'refuse', 'en attente'])->default('en attente');
            $table->integer('nbPersonnes')->nullable();
            $table->time('heureDebut')->nullable();
            $table->integer('duree')->nullable();
            $table->time('heureFin')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('entreprise_id')->nullable();
            $table->enum('payment_status', ['payée', 'rejected', 'pending'])->default('pending');
             $table->integer('nombreSeances')->nullable();
           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('reservation_hotels');
        Schema::dropIfExists('reservation_acts');
        Schema::dropIfExists('reservation_cafe_restos');
        Schema::dropIfExists('reservations');
    }
};
