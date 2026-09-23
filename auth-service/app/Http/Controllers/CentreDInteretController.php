<?php

namespace App\Http\Controllers;


use App\Models\CentreDInteret;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Log;

class CentreDInteretController extends Controller
{
    // Liste tous les centres
    public function index()
    {
        $centres = CentreDInteret::all();
    
        foreach ($centres as $centre) {
            $centre->image = $centre->image ? asset('storage/' . $centre->image) : null;
        }
    
        return response()->json($centres, 200);
    }
    // Crée un nouveau centre
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:centres_d_interet',
            'description' => 'nullable|string',
            'image' => 'nullable|file|image|mimes:jpg,png,jpeg|max:2048', // Validation pour l'image
        ]);
    
        // Créer le centre d'intérêt
        $data = $request->only(['nom', 'description']);
    
        // Gérer l'upload de l'image
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('centre', 'public'); // Stocker dans storage/app/public/centre
            $data['image'] = $path; // Ajouter le chemin de l'image aux données
        }
    
        $centre = CentreDInteret::create($data);
    
        return response()->json($centre, 201);
    }

    // Affiche un centre
    public function show($id)
    {
        $centre = CentreDInteret::findOrFail($id);
        return response()->json($centre);
    }

    // Met à jour un centre
   

  
public function update(Request $request, $id)
{
    $centre = CentreDInteret::findOrFail($id);

    $validated = $request->validate([
        'nom' => 'required|unique:centres_d_interet,nom,' . $centre->id,
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    if ($request->hasFile('image')) {
        // Supprimer l'ancienne image si besoin
        if ($centre->image && Storage::exists($centre->image)) {
            Storage::delete($centre->image);
        }
        $path = $request->file('image')->store('centre', 'public');
        $validated['image'] = '/' . $path;
    }

    $centre->update($validated);

    return response()->json($centre, 200);
}
    // Supprime un centre
    public function destroy($id)
    {
        $centre = CentreDInteret::findOrFail($id);
        $centre->delete();
        return response()->json(['message' => 'Centre supprimé']);
    }

    

   
    public function getUserCentresInteret(Request $request)
    {
        $user = $request->user();
        Log::info('Utilisateur authentifié :', ['user' => $user]);
    
        $centresInteret = $user->centresInteret; // Relation définie dans le modèle User
        Log::info('Centres d\'intérêt récupérés :', ['centresInteret' => $centresInteret]);
    
        return response()->json($centresInteret, 200);
    }
    
    public function addUserCentresInteret(Request $request)
    {
        $request->validate([
            'centres_interet' => 'required|array', // Le champ est requis et doit être un tableau
            'centres_interet.*' => 'exists:centres_d_interet,id', // Chaque élément doit exister dans la table centres_d_interet
        ]);
    
        $user = $request->user();
        $user->centresInteret()->sync($request->centres_interet); // Synchroniser les centres d'intérêt
    
        return response()->json(['message' => 'Centres d\'intérêt mis à jour avec succès'], 200);
    }


}
