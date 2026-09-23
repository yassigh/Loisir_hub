<?php

namespace App\Http\Controllers\Reservations;

use App\Http\Controllers\Controller;
use App\Models\Panier;
use App\Models\PanierItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PanierController extends Controller
{
    //v4.0 index
    public function index(Request $request)
    {
        try {
            $userData = $request->get('user_data');
            // $panier = Panier::with([
            //     'items.reservation.activitePayant:idActP,nomActP',
            //     'items.reservation.activitePayant.images'
            // ])
            $panier = Panier::with([
                'items' => function ($query) {
                    // Ne récupérer que les items non payés
                    $query->where('statut', '!=', 'paye');
                },
                'items.reservation.activitePayant:idActP,nomActP',
                'items.reservation.activitePayant.images'
            ])
                ->where('user_id', $userData['user']['id'])
                ->first();
            if (!$panier) {
                return response()->json(['items' => []]);
            }
            return response()->json([
                'panier' => $panier,
                'items' => $panier->items
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur panier:', $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
    public function addItem(Request $request, $reservationId)
    {
        try {
            $userData = $request->get('user_data');
            $panier = Panier::firstOrCreate(['user_id' => $userData['user']['id']]);

            $item = PanierItem::create([
                'panier_id' => $panier->id,
                'reservation_id' => $reservationId,
                'prix' => $request->prix,
                'statut' => 'en_attente'
            ]);

            return response()->json(['message' => 'Item ajouté', 'item' => $item]);
        } catch (\Exception $e) {
            Log::error('Erreur ajout item:', $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    //v2.0 removeItem
    public function removeItem($itemId)
    {
        try {
            Log::info('Attempting to remove item', ['item_id' => $itemId]);

            $panierItem = PanierItem::with('reservation')->findOrFail($itemId);

            // D'abord supprimer l'item du panier
            $panierItem->delete();

            Log::info('Item removed successfully', ['item_id' => $itemId]);

            return response()->json([
                'message' => 'Item supprimé avec succès',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing item:', [
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //v1.0
    // public function removeItem($itemId)
    // {
    //     try {
    //         $item = PanierItem::findOrFail($itemId);
    //         $item->delete();
    //         return response()->json(['message' => 'Item supprimé']);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur suppression item:', $e->getMessage());
    //         return response()->json(['message' => 'Erreur serveur'], 500);
    //     }
    // }

    public function updateStatus($itemId, Request $request)
    {
        try {
            $item = PanierItem::findOrFail($itemId);
            $item->update(['statut' => $request->statut]);
            return response()->json(['message' => 'Statut mis à jour', 'item' => $item]);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour statut:', $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
}
