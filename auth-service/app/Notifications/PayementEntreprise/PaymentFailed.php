<?php

namespace App\Notifications\PayementEntreprise;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailed extends Notification
{
    use Queueable;
    protected $paymentData;

    public function __construct($paymentData)
    {
        $this->paymentData = $paymentData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Échec du paiement')
            ->greeting('Bonjour,')
            ->line("Le paiement a échoué:")
            ->line("Montant: " . $this->paymentData['montant'] . " TND")
            ->line("Type: " . $this->paymentData['type'])
            ->line("Veuillez réessayer le paiement.");
    }

    public function toArray($notifiable)
    {
        return $this->paymentData;
    }
}

