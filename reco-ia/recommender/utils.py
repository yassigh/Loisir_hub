# filepath: c:\Users\MSI\Desktop\pfe-back\test\reco-ia\recommender\utils.py
def add_images_to_entities(df, entity_type, id_column='id'):
    """
    Associe les images aux entités (événements, postes, activités payantes) en fonction du type et de l'ID.
    """
    from .database import load_data
    _, _, _, _, _, df_images = load_data()

    # Filtrer les images pour le type d'entité donné
    images = df_images[df_images['imageable_type'] == entity_type]

    # Associer les images à l'entité
    return df.merge(images[['url', 'imageable_id']], left_on=id_column, right_on='imageable_id', how='left').rename(columns={'url': 'image_url'})