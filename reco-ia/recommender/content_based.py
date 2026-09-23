from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .database import load_data
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')
french_stop_words = stopwords.words('french')

# Charger uniquement les données nécessaires
_, df_interests, _, _, _, _, _, _ = load_data()

tfidf = TfidfVectorizer(stop_words=french_stop_words)
tfidf_matrix = tfidf.fit_transform(df_interests['description'])
cos_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

def recommander_par_contenu(centre_id, top_n=3):
    sim_scores = list(enumerate(cos_sim[centre_id - 1]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:top_n+1]
    interets_similaires_ids = [i[0] + 1 for i in sim_scores]
    return df_interests[df_interests['id'].isin(interets_similaires_ids)]