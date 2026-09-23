<?php

namespace App\Http\Controllers\Activites;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index()
    {
        $categories = Categorie::all();
        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nomCat' => 'required|string|max:255',
            'descriptionCat' => 'nullable|string'
        ]);

        $categorie = Categorie::create($request->all());
        return response()->json(['message' => 'Catégorie créée avec succès', 'categorie' => $categorie], 201);
    }

    public function show($id)
    {
        $categorie = Categorie::findOrFail($id);
        return response()->json(['categorie' => $categorie]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nomCat' => 'required|string|max:255',
            'descriptionCat' => 'nullable|string'
        ]);

        $categorie = Categorie::findOrFail($id);
        $categorie->update($request->all());
        return response()->json(['message' => 'Catégorie mise à jour avec succès', 'categorie' => $categorie]);
    }

    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);
        $categorie->delete();
        return response()->json(['message' => 'Catégorie supprimée avec succès']);
    }
}
