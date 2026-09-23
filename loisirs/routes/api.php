
<?php
//loiisirs/routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Activites\CategorieController;
use App\Http\Controllers\Activites\ActivitePayantController;
use App\Http\Controllers\Activites\ImageController;
use App\Http\Controllers\Activites\EvenementController;
use App\Http\Controllers\Activites\PubliciteController;
use App\Http\Controllers\Activites\PosteController;
use App\Http\Controllers\CommentaireController;
use App\Http\Controllers\Admin\AdminStatsController;

use App\Http\Middleware\AuthServiceMiddleware;
use App\Http\Middleware\IsAdminMiddleware;
use App\Http\Middleware\IsEntrepriseMiddleware;
use App\Http\Middleware\CheckSubscriptionLimits;
use App\Http\Middleware\IsUserMiddleware;
use App\Http\Middleware\PublicStorageAccess;
use App\Http\Controllers\Reservations\ReservationController;
use App\Http\Controllers\Reservations\PanierController;
use App\Http\Controllers\FavoreController;

use App\Http\Controllers\Paiement\PaiementController;
use App\Http\Controllers\Paiement\PublicitePaiementController;
use App\Http\Controllers\Entreprise\EntrepriseStatsController;

//v3.0
// Route::get('/storage/{path}', [ImageController::class, 'serveImage'])
//     ->where('path', '.*')
//     ->name('storage.serve');
// Routes publiques (GET)
Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/categories/{id}', [CategorieController::class, 'show']);
Route::get('/activites-payantes', [ActivitePayantController::class, 'index']);
Route::get('/activites-payantes/{id}', [ActivitePayantController::class, 'show']);
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{id}', [EvenementController::class, 'show']);
Route::get('/postes', [PosteController::class, 'index']);
Route::get('/postes/{id}', [PosteController::class, 'show']);
Route::get('/commentaires/{elementType}/{elementId}', [CommentaireController::class, 'index']);
Route::get('/success', [PaiementController::class, 'handleSuccess'])->name('payment.success');
Route::get('/fail', [PaiementController::class, 'handleFailure'])->name('payment.failure');
Route::get('/publicites', [PubliciteController::class, 'index']);
Route::get('/publicites/{id}', [PubliciteController::class, 'show']);
Route::get('/entreprises/{entrepriseId}/activities', [ActivitePayantController::class, 'getActivitiesByEntreprise']);
Route::get('/entreprises/{entrepriseId}/events', [EvenementController::class, 'getEventsByEntreprise']);
Route::get('/entreprises/{entrepriseId}/posts', [PosteController::class, 'getEntreprisePosts']);
Route::put('/publicites/{id}/payment-status', [PubliciteController::class, 'updatePaymentStatus']);
Route::get('/{type}/{id}/images', [ImageController::class, 'getImagesForEntity'])
    ->where('type', 'activites-payantes|evenements|postes|publicites');


Route::prefix('paiements/publicites')->group(function () {
    Route::get('/success', [PublicitePaiementController::class, 'handleSuccess'])
        ->name('payment.pub.success');
    Route::get('/failure', [PublicitePaiementController::class, 'handleFailure'])
        ->name('payment.pub.failure');
});
Route::middleware([AuthServiceMiddleware::class])->group(function () {
    // Routes Admin
    Route::middleware([IsAdminMiddleware::class])->group(function () {
        // Gestion des catégories
        //Route::apiResource('categories', CategorieController::class);
        Route::put('/categories/{id}', [CategorieController::class, 'update']);
        Route::delete('/categories/{id}', [CategorieController::class, 'destroy']);
        Route::post('/categories', [CategorieController::class, 'store']);
        //status update activites payantes  evenements  postes
        Route::put('/activites-payantes/{id}/status', [ActivitePayantController::class, 'updateStatus']);
        Route::put('/evenements/{id}/status', [EvenementController::class, 'updateStatus']);
        Route::put('/postes/{id}/status', [PosteController::class, 'updateStatus']);
        Route::put('/publicites/{id}/status', [PubliciteController::class, 'updateStatus']);

        // Get all for admin
        Route::get('/admin/activites-payantes', [ActivitePayantController::class, 'getAllForAdmin']);
        Route::get('/admin/evenements', [EvenementController::class, 'getAllForAdmin']);
        Route::get('/admin/postes', [PosteController::class, 'getAllForAdmin']);
        Route::get('/admin/reservations', [ReservationController::class, 'getAllForAdmin']);
        Route::get('/admin/publicites', [PubliciteController::class, 'getAllForAdmin']);

      
         Route::prefix('admin/stats')->group(function () {
            Route::get('/dashboard', [AdminStatsController::class, 'getDashboardStats']);
            Route::get('/reservations', [AdminStatsController::class, 'getReservationsStatistics']); // Updated
            Route::get('/monthly', [AdminStatsController::class, 'getMonthlyStatistics']); // Updated
        });
    });
  
   

    // Routes Entreprise
    Route::middleware([IsEntrepriseMiddleware::class])->group(function () {
        // Gestion des activités payantes
        //Route::apiResource('activites-payantes', ActivitePayantController::class);
        Route::put('/activites-payantes/{id}', [ActivitePayantController::class, 'update']);
        Route::delete('/activites-payantes/{id}', [ActivitePayantController::class, 'destroy']);
        Route::post('/activites-payantes', [ActivitePayantController::class, 'store']);
        Route::get('/entreprise/commentaires', [CommentaireController::class, 'indexForEntreprise']);
        // Gestion des evenements

        Route::put('/evenements/{id}', [EvenementController::class, 'update']);
        Route::delete('/evenements/{id}', [EvenementController::class, 'destroy']);
        Route::post('/evenements', [EvenementController::class, 'store']);

        // Gestion des postes
        Route::put('/postes/{id}', [PosteController::class, 'update']);
        Route::delete('/postes/{id}', [PosteController::class, 'destroy']);
        Route::post('/postes', [PosteController::class, 'store']);
        //Gestion des publicites
        Route::post('/publicites', [PubliciteController::class, 'store']);
        Route::put('/publicites/{id}', [PubliciteController::class, 'update']);
        Route::delete('/publicites/{id}', [PubliciteController::class, 'destroy']);

        // Gestion des images
        Route::get('/images', [ImageController::class, 'index']);
        Route::post('/{type}/{id}/images', [ImageController::class, 'store'])
            ->where('type', 'activites-payantes|evenements|postes|publicites');
        Route::get('/images/{id}', [ImageController::class, 'show']);
        Route::delete('/images/{id}', [ImageController::class, 'destroy']);
 
        //gestion des reservations 
        Route::put('/entreprise/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
        // Get all for entreprise
        Route::get('/entreprise/activites-payantes', [ActivitePayantController::class, 'getEntrepriseActivities']);
        Route::get('/entreprise/evenements', [EvenementController::class, 'getEntrepriseEvents']);
        Route::get('/entreprise/postes', [PosteController::class, 'getEntreprisePosts']);
        Route::get('/entreprise/reservations', [ReservationController::class, 'getEnterpriseReservations']);
        Route::get('/entreprise/publicites', [PubliciteController::class, 'getEntreprisePublicites']);

        //commentaires
        Route::get('/commentaires/{elementType}/{elementId}', [CommentaireController::class, 'index']);
        Route::post('/commentaires', [CommentaireController::class, 'store']);
        // Routes paiement publicité
        Route::prefix('paiements/publicites')->group(function () {
            Route::post('/initiate', [PublicitePaiementController::class, 'initiatePublicitePayment'])
                ->name('payment.initiate.publicite');
            Route::get('/verify/{paymentId}', [PublicitePaiementController::class, 'verifyPublicitePayment'])
                ->name('payment.publicite.verify');
        });

        Route::prefix('entreprise/stats')->group(function () {
            Route::get('/dashboard', [EntrepriseStatsController::class, 'getDashboardStats']);
        });
      
    });
    
 
    // Routes Utilisateur standard
    Route::middleware([IsUserMiddleware::class])->group(function () {
        // Route::get('/commentaires/{elementType}/{elementId}', [CommentaireController::class, 'index']);
        Route::post('/commentaires', [CommentaireController::class, 'store']);
        Route::put('/commentaires/{commentaire}', [CommentaireController::class, 'update']);
        Route::delete('/commentaires/{commentaire}', [CommentaireController::class, 'destroy']);
        Route::post('/favores', [FavoreController::class, 'store']); // Ajouter une Favore
        Route::get('/favores/{user_id}', [FavoreController::class, 'index']); // Lister les Favores d'un utilisateur
        Route::delete('/favores/{id}', [FavoreController::class, 'destroy']); // Supprimer une Favore
        Route::put('/favores/{id}', [FavoreController::class, 'update']); // Modifier une Favore
        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::get('/reservations', [ReservationController::class, 'index']); // Lister les réservations d'un utilisateur
        Route::get('/reservations/{id_Res}', [ReservationController::class, 'show']); // Afficher une réservation spécifique
        Route::put('/reservations/{id_Res}', [ReservationController::class, 'update']); // Modifier une réservation
        Route::delete('/reservations/{id_Res}', [ReservationController::class, 'destroy']); // Supprimer une réservation
        Route::get('/historique/reservations', [ReservationController::class, 'getPaymentHistory']);

        
        Route::prefix('panier')->group(function () {
            Route::get('/', [PanierController::class, 'index']);
            Route::post('/add/{reservationId}', [PanierController::class, 'addItem']);
            Route::delete('/remove/{itemId}', [PanierController::class, 'removeItem']);
            Route::put('/status/{itemId}', [PanierController::class, 'updateStatus']);
        });

        Route::get('/commentaires/{elementType}/{elementId}', [CommentaireController::class, 'index']);
        // Route::get('/paniers', [PanierController::class, 'index']); // Lister les paniers d'un utilisateur
        // Route::get('/user-reservations/{user_id}', [PanierController::class, 'getUserReservations']); // Lister les réservations d'un utilisateur
        // Route::delete('/pending-reservation/{user_id}/{id}', [PanierController::class, 'deletePendingReservation']); // Supprimer une réservation en attente
        // Route::get('/paniers/total-accepted-price/{user_id}', [PanierController::class, 'calculateTotalAcceptedPrice']); // Calculer la somme des prix_total pour un utilisateur donné et dont l'état est "accepte"

    Route::prefix('paiements')->group(function () {
            Route::post('/reservation/{reservationId}', [PaiementController::class, 'initiatePayment'])
                ->name('payment.initiate');
            Route::get('/verify/{paymentId}', [PaiementController::class, 'verifyPayment'])
                ->name('payment.verify');

            // //route paiement publicite 
            // Route::post('/publicites/initiate', [PaiementController::class, 'initiatePublicitePayment'])
            //     ->name('payment.initiate.publicite');
            // Route::get('/publicites/success', [PaiementController::class, 'handlePubliciteSuccess'])
            //     ->name('payment.success.publicite');
            // Route::get('/publicites/failure', [PaiementController::class, 'handlePubliciteFailure'])
            //     ->name('payment.failure.publicite');
        });
    });
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
