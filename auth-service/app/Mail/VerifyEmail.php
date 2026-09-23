<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;
    public $user;
    /**
     * Create a new message instance.
     */
    public function __construct($user)
    {
        $this->user = $user;
    }
    
    public function build()
    {
        return $this->subject('Vérifiez votre adresse email')
                    ->view('emails.verify-email')
                    ->with([
                        'activationUrl' => config('app.url') . '/api/user/verify-email/' . $this->user->activation_token
                    ]);
    }
}
