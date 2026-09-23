<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailEn extends Mailable
{
    use Queueable, SerializesModels;
    public $entreprise;
    /**
     * Create a new message instance.
     */
    public function __construct($entreprise)
    {
        $this->entreprise = $entreprise;
    }
    
    public function build()
    {
        return $this->subject('Vérifiez votre adresse email')
                    ->view('emails.verify-email-en')
                    ->with([
                        'activationUrl' => config('app.url') . '/api/entreprise/verify-email/' . $this->entreprise->activation_token
                    ]);
    }
}
