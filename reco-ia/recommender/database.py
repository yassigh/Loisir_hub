# filepath: c:\Users\MSI\Desktop\pfe-back\test\reco-ia\recommender\database.py
import pandas as pd
from sqlalchemy import create_engine

def get_connection_auth_service():
    # Connexion à la base de données auth-service
    return create_engine("mysql+mysqlconnector://root:@127.0.0.1/auth-service")

def get_connection_backend():
    # Connexion à la base de données backend
    return create_engine("mysql+mysqlconnector://root:@127.0.0.1/backend")

def load_data():
    # Connexion aux bases de données
    conn_auth = get_connection_auth_service()
    conn_backend = get_connection_backend()

    # Charger les données depuis auth-service
    df_user_interests = pd.read_sql("SELECT * FROM user_centre_interet", conn_auth)
    df_interests = pd.read_sql("SELECT * FROM centres_d_interet", conn_auth)
    df_entreprises = pd.read_sql("SELECT * FROM entreprises", conn_auth)  # <-- LIGNE CORRECTEMENT ALIGNÉE
    df_subscriptions = pd.read_sql("SELECT * FROM subscriptions", conn_auth)
    # Charger les données depuis backend
    df_events = pd.read_sql("SELECT * FROM evenements", conn_backend)
    df_activities = pd.read_sql("SELECT * FROM activite_payants", conn_backend)
    df_posts = pd.read_sql("SELECT * FROM postes", conn_backend)
    df_images = pd.read_sql("SELECT * FROM images", conn_backend)

    # Retourner les DataFrames
    return df_user_interests, df_interests, df_events, df_activities, df_posts, df_images, df_entreprises, df_subscriptions