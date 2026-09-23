from recommender.recommender import recommander_utilisateur
from recommender.content_based import recommander_par_contenu

# Test : Recommandation pour un utilisateur
print("Recommandation utilisateur basée sur similarité :")
print(recommander_utilisateur(1))

# Test : Recommandation par contenu
print("\nRecommandation par contenu (par description) :")
print(recommander_par_contenu(2))
