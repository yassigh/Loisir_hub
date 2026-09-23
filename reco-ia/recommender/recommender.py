import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from .database import load_data
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords
from googlesearch import search
import datetime

# Télécharger les stop words en français
nltk.download('stopwords')
french_stop_words = stopwords.words('french')

# Charger les données
df_user_interests, df_interests, df_events, df_activities, df_posts, df_images, df_entreprises, df_subscriptions = load_data()

def add_images_to_entities(df, entity_type, id_column='id'):
    images = df_images[df_images['imageable_type'] == entity_type]
    return df.merge(images, left_on=id_column, right_on='imageable_id', how='left')

df_events = add_images_to_entities(df_events, 'App\\Models\\Evenement', id_column='id')
df_activities = add_images_to_entities(df_activities, 'App\\Models\\ActivitePayant', id_column='idActP')
df_posts = add_images_to_entities(df_posts, 'App\\Models\\Poste', id_column='id')

def recommander_personnalise(user_id, top_n=30):
    print(f"=== Appel recommander_personnalise pour user_id={user_id} ===")
    user_interests = df_user_interests[df_user_interests['user_id'] == user_id]['centre_d_interet_id']
    print("Centres d'intérêt trouvés :", user_interests.tolist())

    if user_interests.empty:
        print(f"Aucun centre d'intérêt trouvé pour user_id={user_id}")
        return pd.DataFrame()

    today = datetime.datetime.now().date()
    print("Date du jour :", today)

    print("df_subscriptions colonnes :", df_subscriptions.columns)
    print("df_subscriptions exemples :", df_subscriptions.head())

    active_subs = df_subscriptions[
        (df_subscriptions['status'] == 'active') &
        (pd.to_datetime(df_subscriptions['end_date']).dt.date >= today)
    ]
    print("Abonnements actifs :", active_subs)

    abonnees_ids = active_subs['entreprise_id'].unique().tolist()
    print("Entreprises abonnées :", abonnees_ids)
    # Force les types pour éviter les soucis de matching
    df_events['categorie_id'] = df_events['categorie_id'].astype(int)
    df_events['entreprise_id'] = df_events['entreprise_id'].astype(int)
    df_activities['categorie_id'] = df_activities['categorie_id'].astype(int)
    df_activities['entreprise_id'] = df_activities['entreprise_id'].astype(int)
    df_posts['categorie_id'] = df_posts['categorie_id'].astype(int)
    df_posts['entreprise_id'] = df_posts['entreprise_id'].astype(int)
    user_interests = user_interests.astype(int)
    abonnees_ids = [int(x) for x in abonnees_ids]
    filtered_events = df_events[
        (df_events['categorie_id'].isin(user_interests)) &
        (df_events['entreprise_id'].isin(abonnees_ids))
    ]
    filtered_activities = df_activities[
        (df_activities['categorie_id'].isin(user_interests)) &
        (df_activities['entreprise_id'].isin(abonnees_ids))
    ]
    filtered_posts = df_posts[
        (df_posts['categorie_id'].isin(user_interests)) &
        (df_posts['entreprise_id'].isin(abonnees_ids))
    ]

    print("Nb activités filtrées:", len(filtered_activities))
    print("Nb posts filtrés:", len(filtered_posts))
    print("Nb events filtrés:", len(filtered_events))
# Pour les événements
    event_id_col = 'id'
    if 'id' not in filtered_events.columns and 'id_x' in filtered_events.columns:
        event_id_col = 'id_x'

    # Pour les posts
    post_id_col = 'id'
    if 'id' not in filtered_posts.columns and 'id_x' in filtered_posts.columns:
        post_id_col = 'id_x'
    # Utilise les bons noms de colonnes pour la concaténation
    df_filtered_combined = pd.concat([
        filtered_events[[event_id_col, 'nomEvent', 'descriptionEvent', 'url']].rename(
            columns={event_id_col: 'id', 'nomEvent': 'nom', 'descriptionEvent': 'description'}
        ).assign(type='evenement'),
        filtered_activities[['idActP', 'nomActP', 'descriptionP', 'url']].rename(
            columns={'idActP': 'id', 'nomActP': 'nom', 'descriptionP': 'description'}
        ).assign(type='activite_payante'),
        filtered_posts[[post_id_col, 'nomPoste', 'descriptionPoste', 'url']].rename(
            columns={post_id_col: 'id', 'nomPoste': 'nom', 'descriptionPoste': 'description'}
        ).assign(type='poste')
    ], ignore_index=True)

    print("Nb total entités fusionnées :", len(df_filtered_combined))

    if df_filtered_combined.empty:
        print(f"Aucune donnée disponible pour user_id={user_id}")
        return pd.DataFrame()

    user_interest_texts = df_interests[df_interests['id'].isin(user_interests)]['nom'].tolist()
    user_query = " ".join(user_interest_texts)
    print(f"Requête utilisateur pour user_id={user_id} :", user_query)
    df_filtered_combined['nom'] = df_filtered_combined['nom'].fillna('')
    df_filtered_combined['description'] = df_filtered_combined['description'].fillna('')
    print(df_filtered_combined[['nom', 'description']].head()) 
    tfidf = TfidfVectorizer(stop_words=french_stop_words)
    try:
        tfidf_matrix = tfidf.fit_transform(df_filtered_combined['nom'] + " " + df_filtered_combined['description'])
        user_query_vector = tfidf.transform([user_query])
        cos_sim = cosine_similarity(user_query_vector, tfidf_matrix).flatten()
        sim_scores = list(enumerate(cos_sim))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        recommended_indices = [i[0] for i in sim_scores][:top_n]
        print("Indices recommandés :", recommended_indices)
        return df_filtered_combined.iloc[recommended_indices]
    except Exception as e:
        print(f"Erreur lors du calcul TF-IDF pour user_id={user_id}: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()


def recommander_pour_tous_les_utilisateurs(top_n=40):
    """
    Recommande des activités, événements et postes pour tous les utilisateurs.
    """
    user_ids = df_user_interests['user_id'].unique()
    recommandations = {}
    for user_id in user_ids:
        recommandations[user_id] = recommander_personnalise(user_id, top_n).to_dict(orient='records')
    return recommandations

def get_recommendations(user_id, top_n=40):
    return recommander_personnalise(user_id, top_n)

def generate_posts_from_interests(user_id):
    """
    Génère des postes basés sur les centres d'intérêt d'un utilisateur.
    """
    df_user_interests, df_interests, _, _, _, _, _, _ = load_data()
    user_interests = df_user_interests[df_user_interests['user_id'] == user_id]['centre_d_interet_id'].tolist()
    if not user_interests:
        return pd.DataFrame({'message': ['Aucun centre d\'intérêt trouvé pour cet utilisateur.']})

    filtered_interests = df_interests[df_interests['id'].isin(user_interests)]
    posts = []
    for _, interest in filtered_interests.iterrows():
        query = f"{interest['nom']} conseils"
        google_results = list(search(query, num_results=1))
        description = (
            interest['description']
            if 'description' in interest and pd.notna(interest['description'])
            else f"Découvrez des conseils et informations utiles sur {interest['nom']}."
        )
        if google_results:
            try:
                import requests
                from bs4 import BeautifulSoup
                response = requests.get(google_results[0])
                soup = BeautifulSoup(response.content, 'html.parser')
                paragraphs = soup.find_all('p')
                for paragraph in paragraphs:
                    text = paragraph.get_text(strip=True)
                    if len(text) > 50 and not any(word in text.lower() for word in ['téléphone', 'merci', 'contact']):
                        description = text
                        break
            except Exception as e:
                print(f"Erreur lors de l'extraction de la description pour {interest['nom']}: {e}")

        post = {
            "nom": interest['nom'],
            "description": description,
            "image_url": interest['image'] if 'image' in interest and interest['image'] else f"https://source.unsplash.com/600x400/?{interest['nom']}",
            "source": google_results[0] if google_results else "Aucune source trouvée"
        }
        posts.append(post)
    return pd.DataFrame(posts)

def get_daily_recommendations(top_n=10):
    """
    Génère des recommandations quotidiennes pour tous les utilisateurs.
    Retourne les recommandations groupées par type.
    """
    try:
        print("Starting daily recommendations generation")
        user_ids = df_user_interests['user_id'].unique()
        print(f"Found {len(user_ids)} users")
        all_recommendations = {
            'activite_payante': [],
            'poste': [],
            'evenement': []
        }
        for user_id in user_ids:
            print(f"Processing user {user_id}")
            user_recommendations = recommander_personnalise(user_id, top_n)
            if not user_recommendations.empty:
                for entity_type in ['activite_payante', 'poste', 'evenement']:
                    type_recs = user_recommendations[user_recommendations['type'] == entity_type]
                    if not type_recs.empty:
                        for _, rec in type_recs.iterrows():
                            formatted_rec = {
                                'id': int(rec['id']),
                                'nom': rec['nom'],
                                'description': rec['description'],
                                'type': rec['type'],
                                'user_id': int(user_id),
                                'url': None if pd.isna(rec['url']) else rec['url']
                            }
                            all_recommendations[entity_type].append(formatted_rec)
                            print(f"Added recommendation for user {user_id}: {formatted_rec['nom']}")
        total_recs = sum(len(recs) for recs in all_recommendations.values())
        print(f"Generated {total_recs} total recommendations")
        if total_recs == 0:
            print("No recommendations generated")
            return None
        return all_recommendations
    except Exception as e:
        print(f"Error in get_daily_recommendations: {str(e)}")
        return None