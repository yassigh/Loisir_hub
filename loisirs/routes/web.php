<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Paiement\PublicitePaiementController;


Route::get('/', function () {
    return view('welcome');
});
Route::prefix('payment')->group(function () {
    Route::view('/reservation/success', 'payment.reservation.success')->name('payment.reservation.success');
    // Route::view('/publicite/success', 'payment.publicite.success')->name('payment.publicite.success');
    // Route::view('/failure', 'payment.failure')->name('payment.failure');
});
// Route::prefix('paiements/publicites')->group(function () {
//     Route::get('/success', [PublicitePaiementController::class, 'handleSuccess'])
//         ->name('payment.pub.success');
//     Route::get('/fail', [PublicitePaiementController::class, 'handleFailure'])
//         ->name('payment.pub.failure');
// });
