from flask import Flask, jsonify, request
from recommender.content_based import recommander_par_contenu
from recommender.utils import add_images_to_entities
from recommender.recommender import recommander_personnalise, get_recommendations, recommander_pour_tous_les_utilisateurs
from recommender.recommender import generate_posts_from_interests

from recommender.recommender import get_daily_recommendations
import json
app = Flask(__name__)
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
@app.route('/api/reco/content/<int:centre_id>', methods=['GET'])
def reco_content(centre_id):
    recommandations = recommander_par_contenu(centre_id)
    return recommandations.to_json(orient='records')

@app.route('/api/debug/data', methods=['GET'])
def debug_data():
    from recommender.database import load_data
    df_user_interests, df_interests = load_data()
    return jsonify({
        "user_centre_interet": df_user_interests.to_dict(orient='records'),
        "centres_d_interet": df_interests.to_dict(orient='records')
    })

@app.route('/api/reco/personal/<int:user_id>', methods=['GET'])
def reco_personal(user_id):
    from recommender.recommender import recommander_personnalise
    recommandations = recommander_personnalise(user_id)
    return recommandations.to_json(orient='records')

@app.route('/api/reco/just-for-you/<int:user_id>', methods=['GET'])
def reco_just_for_you(user_id):
    from recommender.recommender import get_recommendations
    try:
        recommandations = get_recommendations(user_id)

        if recommandations is None or recommandations.empty or 'type' not in recommandations.columns:
            grouped_recommendations = {
                "activite_payante": [],
                "poste": [],
                "evenement": [],
            }
        else:
            grouped_recommendations = {
                "activite_payante": recommandations[recommandations['type'] == 'activite_payante'].to_dict(orient='records'),
                "poste": recommandations[recommandations['type'] == 'poste'].to_dict(orient='records'),
                "evenement": recommandations[recommandations['type'] == 'evenement'].to_dict(orient='records'),
            }
        return jsonify(grouped_recommendations)
    except Exception as e:
        # Toujours retourner du JSON même en cas d'erreur
        return jsonify({"error": str(e)}), 500
@app.route('/api/reco/all-users', methods=['GET'])
def reco_all_users():
    """
    Retourne les recommandations pour tous les utilisateurs.
    """
    try:
        recommandations = recommander_pour_tous_les_utilisateurs()
        return jsonify(recommandations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/posts/<int:user_id>', methods=['GET'])
def generate_posts(user_id):
    try:
        posts = generate_posts_from_interests(user_id)
        if posts is None:
            return jsonify([])  # Liste vide
        return posts.to_json(orient='records')
    except Exception as e:
        print("Erreur dans generate_posts:", str(e))
        return jsonify([]), 500
@app.route('/api/notifications/send-daily-recommendations', methods=['POST'])
def send_daily_recommendations():
    try:
        print("Starting recommendation generation...")
        recommendations = get_daily_recommendations()
        print("Recommendations generated:", recommendations)
        
        if not recommendations or not any(recommendations.values()):
            print("No recommendations generated")
            return jsonify({"error": "No recommendations available"}), 404
            
        return jsonify(recommendations)
    except Exception as e:
        print("Error generating recommendations:", str(e))
        return jsonify({"error": str(e)}), 500    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)