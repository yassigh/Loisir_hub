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
        Schema::create('panier_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('panier_id');
            $table->unsignedBigInteger('reservation_id');
            $table->decimal('prix', 10, 2);
            $table->enum('statut', ['en_attente', 'paye', 'expire'])->default('en_attente');
            $table->timestamps();

            $table->foreign('panier_id')->references('id')->on('paniers')->onDelete('cascade');
            $table->foreign('reservation_id')->references('id_Res')->on('reservations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('panier_items');
    }
};
