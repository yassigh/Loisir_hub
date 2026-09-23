<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\EntrepriseAuthController;
use App\Http\Controllers\Auth\UserAuthController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\Auth\AdminController;
use App\Http\Controllers\Admin\AdminStatsController;
use App\Http\Controllers\Entreprise\EntrepriseStatsController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\SessionActivityCheck;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Notifications\NotificationController;
use App\Http\Controllers\PubliciteController;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\CentreDInteretController;
use App\Models\User;
use App\Http\Controllers\Paiement\SubscriptionPaymentController;
use App\Http\Controllers\Paiement\PublicitePaiementController;
use App\Http\Controllers\Subscription\PlanController;
use App\Http\Controllers\Subscription\SubscriptionController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;

Route::get('/entreprise/batch', [EntrepriseAuthController::class, 'getBatchEnterprises']);

Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
    Route::prefix('admin/stats')->group(function () {
        Route::get('/dashboard', [AdminStatsController::class, 'getDashboardStats']);
        Route::get('/analytics', [AdminStatsController::class, 'getAnalytics']);
    });
});
Route::prefix('notifications')->group(function () {
    // Route pour envoyer des notifications (accessible par le service loisirs)
    Route::post('/send', [NotificationController::class, 'sendToAdmins']);
    Route::post('/sendEntreprise', [NotificationController::class, 'sendToEntreprises']);
    Route::post('/sendToUser', [NotificationController::class, 'sendToUsers']);
  Route::post('/send-daily-recommendations', [NotificationController::class, 'sendDailyRecommendations']);
    Route::get('/', [NotificationController::class, 'getNotifications']);
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
});
Route::prefix('notifications')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [NotificationController::class, 'getNotifications']);
    Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/connectables', [ConversationController::class, 'getConnectables']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
  
    Route::post('/conversations/find', [ConversationController::class, 'findByParticipants']);

    Route::get('/entreprises/{id}', [EntrepriseAuthController::class, 'show']);
});

Route::get('/entreprises', [EntrepriseAuthController::class, 'index']);
//Public Routes
Route::get('/success', [SubscriptionPaymentController::class, 'handleSuccess'])->name('payment.success');
Route::get('/fail', [SubscriptionPaymentController::class, 'handleFailure'])->name('payment.failure');

Route::prefix('publicites')->group(function () {
    Route::get('/images', [PubliciteController::class, 'getAllImages']);
    
    Route::get('/', [PubliciteController::class, 'index']);
    Route::get('/active', [PubliciteController::class, 'getActivePublicites']);
    Route::middleware(['auth:sanctum'])->group(function () {
        
        Route::post('/', [PubliciteController::class, 'store']);
        Route::put('/{publicite}', [PubliciteController::class, 'update']);
        Route::delete('/{publicite}', [PubliciteController::class, 'destroy']);
    });
});

Route::middleware('auth:sanctum')->post('/conversations/entreprise-to-admin', [ConversationController::class, 'entrepriseToAdmin']);

Route::prefix('centres-interet')->group(function () {
    Route::get('/', [CentreDInteretController::class, 'index']); // Liste tous les centres
    Route::post('/', [CentreDInteretController::class, 'store']); // Crée un nouveau centre
    Route::get('/{id}', [CentreDInteretController::class, 'show']); // Affiche un centre spécifique
    Route::put('/{id}', [CentreDInteretController::class, 'update']); // Met à jour un centre
    Route::delete('/{id}', [CentreDInteretController::class, 'destroy']); // Supprime un centre
});
//ENTREPRISE
Route::prefix('entreprise')->group(function () {
    Route::post('/register', [EntrepriseAuthController::class, 'register']);
    Route::post('/login', [EntrepriseAuthController::class, 'login']);
    Route::get('/verify-email/{token}', [EntrepriseAuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetCodeE']);
    Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyResetCodeE']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPasswordE']);
    Route::get('/entreprises/{id}', [EntrepriseAuthController::class, 'getEntrepriseById']);
     Route::post('/flouci-credentials', [EntrepriseAuthController::class, 'updateFlouciCredentials']);

    Route::middleware(['auth:sanctum'])->prefix('subscriptions')->group(function () {
        Route::get('/current', [SubscriptionController::class, 'getCurrentSubscription']);
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
        Route::post('/cancel', [SubscriptionController::class, 'cancel']);
        Route::get('/history', [SubscriptionController::class, 'history']);
        Route::get('/limits', [SubscriptionController::class, 'getSubscriptionLimits']);
        Route::post('/initiate', [SubscriptionPaymentController::class, 'initiatePayment'])->name('payment.initiate');
        Route::get('/verify/{paymentId}', [SubscriptionPaymentController::class, 'verifyPayment'])->name('payment.verify');
    });


     Route::middleware(['auth:sanctum'])->prefix('paiements')->group(function () {
        Route::post('/publicites/initiate', [PublicitePaiementController::class, 'initiatePublicitePayment']);
    });

});
Route::middleware(['auth:sanctum',SessionActivityCheck::class])->group(function () {
    Route::prefix('entreprise')->group(function () {
        Route::post('/logout', [EntrepriseAuthController::class, 'logout']);
        Route::post('/update', [EntrepriseAuthController::class, 'updateProfile']);
        Route::delete('/desactiver', [EntrepriseAuthController::class, 'desactiverProfile']);
        Route::get('/getDetails', [EntrepriseAuthController::class, 'getEntrepriseDetails']);
        Route::post('/flouci-credentials', [EntrepriseAuthController::class, 'updateFlouciCredentials']);
        Route::get('/has-flouci-credentials', [EntrepriseAuthController::class, 'hasFlouciCredentials']);

    });

     Route::prefix('entreprise/stats')->group(function () {
        Route::get('/dashboard', [EntrepriseStatsController::class, 'getDashboardStats']);
    });
});
Route::middleware(['auth:sanctum',SessionActivityCheck::class])->post('/entreprise/upload-logo', [EntrepriseAuthController::class, 'uploadLogo']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/users/{id}/exists', [UserAuthController::class, 'checkUserExists']);
    Route::post('/user/upload-image', [UserAuthController::class, 'uploadImage']);
    Route::post('/entreprise/upload-logo', [EntrepriseAuthController::class, 'uploadLogo']);

});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/centres-interet', [CentreDInteretController::class, 'index']);
    Route::post('/user/centres-interet', [CentreDInteretController::class, 'addUserCentresInteret']);
    Route::put('/{id}', [CentreDInteretController::class, 'update']); // Met à jour un centre
    Route::delete('/{id}', [CentreDInteretController::class, 'destroy']); // Supprime un centre


Route::middleware('auth:sanctum')->get('/user/centres-interet', [CentreDInteretController::class, 'getUserCentresInteret']);
});
//USER
Route::prefix('user')->group(function () {
    Route::post('/register', [UserAuthController::class, 'register']);
    Route::post('/login', [UserAuthController::class, 'login']);
    Route::get('/verify-email/{token}', [UserAuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetCode']);
    Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyResetCode']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
});
Route::middleware(['auth:sanctum',SessionActivityCheck::class])->group(function () {
    Route::prefix('user')->group(function () {
        Route::post('/logout', [UserAuthController::class, 'logout']);
        Route::post('/update', [UserAuthController::class, 'updateProfile']);
        Route::delete('/desactiver', [UserAuthController::class, 'desactiverProfile']);
        Route::get('/getDetails', [UserAuthController::class, 'getUserDetails']);
 
    });
   });
Route::prefix('user')->group(function () {
    Route::get('/users/{id}', [UserAuthController::class, 'getUserById']);

});

Route::middleware(['auth:sanctum',SessionActivityCheck::class])->post('/upload-image', [UserAuthController::class, 'uploadImage']);


//ADMIN
Route::prefix('admin')->group(function () {
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->get('/users', [AdminController::class, 'getAllUsers']);
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->get('/entreprises', [AdminController::class, 'getAllEntreprises']);
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->get('/users/{id}', [AdminController::class, 'getUser']);
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->get('/entreprises/{id}', [AdminController::class, 'getEntreprise']);
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->delete('/entreprises/{id}', [AdminController::class, 'deleteEntreprise']);
      Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']); 

    //Route::middleware(['auth:sanctum', AdminMiddleware::class])->post('/notifications', [NotificationController::class, 'sendToAdmins']);
    // Route::middleware(['auth:sanctum', AdminMiddleware::class])->get('/admin/publicites', [PubliciteController::class, 'getAllForAdmin']);
});
Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
    Route::prefix('admin/stats')->group(function () {
        // Stats générales
        Route::get('/dashboard', [AdminStatsController::class, 'getDashboardStats']);
        
        // Stats détaillées
        Route::get('/users', [AdminStatsController::class, 'getUserStats']);
        Route::get('/entreprises', [AdminStatsController::class, 'getEntrepriseStats']);
        Route::get('/revenue', [AdminStatsController::class, 'getRevenueStats']);
        
        // Stats mensuelles
        Route::get('/monthly/subscriptions', [AdminStatsController::class, 'getMonthlySubscriptionStats']);
        Route::get('/monthly/publicites', [AdminStatsController::class, 'getMonthlyPubliciteStats']);
    });
      Route::prefix('admin')->group(function () {
        Route::get('/subscriptions', [SubscriptionController::class, 'getAllSubscriptions']);
        Route::get('/subscriptions/{id}', [SubscriptionController::class, 'getSubscriptionDetails']);
    });
});



//CONNECT WITH GOOGLE
Route::get('auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::post('auth/google/mobile', [GoogleAuthController::class, 'handleMobileGoogleAuth']);

// Routes pour les plans d'abonnement
Route::prefix('subscription-plans')->group(function () {
    // Routes publiques
    Route::get('/', [PlanController::class, 'index']);
    Route::get('/{id}', [PlanController::class, 'show']);

    // Routes protégées (admin seulement)
    Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
        Route::post('/', [PlanController::class, 'store']);
        Route::put('/{id}', [PlanController::class, 'update']);
        Route::delete('/{id}', [PlanController::class, 'destroy']);
    });
});
//subscriptions
Route::prefix('subscriptions')->group(function () {
    Route::post('/batch-limits', [SubscriptionController::class, 'getBatchLimits']);
}); 

Route::middleware('auth:sanctum')->get('/validate-token', function () {
    $user = \Illuminate\Support\Facades\Auth::user();
    Log::debug('User data:', ['user' => $user]); // Debug log

    if ($user instanceof \App\Models\Entreprise) {
        $type = 'entreprise';
    } else {
        // Check user role
        if ($user->role === 'admin') {
            $type = 'admin';
        } else {
            $type = 'user';
        }
    }
    return response()->json([
        'valid' => true,
        'user' => [
            'id' => $user->id,
            'type' => $type,
            'email' => $user->email
        ]
    ]);
});

Route::get('/storage/{path}', function($path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        return response()->json([
            'error' => 'File not found',
            'path' => $filePath
        ], 404);
    }

    return response()->file($filePath, [
        'Content-Type' => mime_content_type($filePath),
        'Content-Disposition' => 'inline',
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->where('path', '.*');