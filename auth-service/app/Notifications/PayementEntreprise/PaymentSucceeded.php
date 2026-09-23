<?php

namespace App\Notifications\PayementEntreprise;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSucceeded extends Notification
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
        $message = (new MailMessage)
            ->subject('Paiement réussi')
            ->greeting('Bonjour,');

        if (isset($this->paymentData['entreprise_nom'])) {
            $message->line("L'entreprise {$this->paymentData['entreprise_nom']} a effectué un paiement avec succès:");
        }

        $message->line("Montant: " . $this->paymentData['montant'] . " TND")
            ->line("Type: " . $this->paymentData['type'])
            ->line("Date: " . $this->paymentData['date']);

        return $message;
    }

    public function toArray($notifiable)
    {
        return [
            'montant' => $this->paymentData['montant'],
            'transaction_id' => $this->paymentData['transaction_id'],
            'date' => $this->paymentData['date'],
            'type' => $this->paymentData['type'],
            'entreprise_nom' => $this->paymentData['entreprise_nom'] ?? null
        ];
    }
}
