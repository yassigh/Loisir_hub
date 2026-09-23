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
        Schema::create('entreprises', function (Blueprint $table) {
            $table->id(); 
            $table->string('nomE');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('reset_code')->nullable();
            $table->string('activation_token')->nullable();
            $table->boolean('is_active')->default(false);
            $table->string('matriculeE')->unique();
            $table->string('lien_facebook_E')->nullable();;
            $table->string('logoE')->nullable();
            $table->string('lien_site_E')->nullable();
            $table->string('villeE');
            $table->string('adresseE');   
            $table->text('flouci_public_key', 1000)->nullable();
            $table->text('flouci_secret_key', 1000)->nullable();
            $table->text('flouci_developer_id', 1000)->nullable();        
                    
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entreprises');
    }
};
