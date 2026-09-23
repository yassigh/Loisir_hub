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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entreprise_id')->constrained();
            $table->foreignId('plan_id')->constrained('subscription_plans');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('status'); // active, expired, cancelled
            $table->string('payment_status')->default('pending'); // pending, completed
            $table->decimal('amount_paid', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
