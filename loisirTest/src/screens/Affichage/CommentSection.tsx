import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { getComments, addComment, updateComment, deleteComment } from '../services/commentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { getUserByIdd } from '../services/authService';
import { Image } from 'react-native';
import { authApi } from '../services/Api';

interface Comment {
  id: number;
  contenu: string;
  user_id?: string | null;
  entreprise_id: number | null;
  element_id: number;
  element_type: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

interface CommentSectionProps {
  elementId: number;
  elementType: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ elementId, elementType }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [error, setError] = useState<string>('');
  const [visibleCommentsCount, setVisibleCommentsCount] = useState<number>(2); // Commence avec 2 commentaires visibles
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchCurrentUserId();
      await fetchComments();
    };
    const resetUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user_data');
        if (!userDataString) {
          console.error('Aucun utilisateur trouvé dans AsyncStorage.');
          return;
        }
    
        const userData = JSON.parse(userDataString);
        console.log('Données utilisateur récupérées:', userData);
    
        // Utilisez ces données pour les opérations nécessaires
        setCurrentUserId(userData.id);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };
    const fetchComments = async () => {
      try {
        const data = await getComments(elementType, elementId);
        const commentsWithUserNames = await Promise.all(
          data.map(async (comment: Comment) => {
            try {
              const user = await getUserByIdd(comment.user_id);
              return { ...comment, user_name: user ? `${user.first_name} ${user.last_name}` : 'Utilisateur inconnu' };
            } catch {
              return { ...comment, user_name: 'Utilisateur inconnu' };
            }
          })
        );
        setComments(commentsWithUserNames);
      } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        setError('Erreur lors de la récupération des commentaires');
      }
    };
    const fetchCurrentUserId = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user_data');
        console.log('Données utilisateur brutes depuis AsyncStorage:', userDataString);
    
        if (!userDataString) {
          console.error('Aucun utilisateur trouvé dans AsyncStorage.');
          return;
        }
    
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          setCurrentUserId(userData.id);
          console.log('currentUserId:', userData.id);
        } else {
          console.error('Les données utilisateur sont invalides.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
      }
    };
    resetUserData();
    initialize();
    fetchCurrentUserId();
    fetchComments();
  }, [elementId, elementType]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Erreur", "Le commentaire ne peut pas être vide.");
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour commenter.");
        return;
      }
  
      const commentData = {
        contenu: newComment,
        element_id: elementId,
        element_type: elementType
      };
  
      const addedComment = await addComment(commentData);
      
      // Récupérer les informations de l'utilisateur connecté
      const userDataString = await AsyncStorage.getItem('user_data');
      const userData = JSON.parse(userDataString || '{}');
      
      // Ajouter le nouveau commentaire avec les informations utilisateur
      const newCommentWithUser = {
        ...addedComment,
        user_name: `${userData.first_name} ${userData.last_name}`,
        created_at: new Date().toISOString()
      };
  
      setComments(prevComments => [newCommentWithUser, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le commentaire. Veuillez réessayer.'
      );
    }
  };
  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.contenu.trim()) {
      Alert.alert("Le commentaire ne peut pas être vide.");
      return;
    }

    try {
      await updateComment(editingComment.id, { contenu: editingComment.contenu });
      setComments(comments.map(comment => comment.id === editingComment.id ? editingComment : comment));
      setEditingComment(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le commentaire.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le commentaire.');
    }
  };

  const formatTimeAgo = (date: string) => {
    return moment(date).fromNow();
  };
  console.log('currentUserId:', currentUserId, typeof currentUserId);
 return (
    <View style={styles.container}>
      <Text style={styles.title}>Commentaires</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView 
        style={styles.commentList} 
        keyboardShouldPersistTaps="handled"
      >
   {comments.slice(0, visibleCommentsCount).map(comment => {
  return (
    <View key={comment.id} style={styles.comment}>
      <Text style={styles.commentUser}>Par {comment.user_name}</Text>
      <Text style={styles.commentText}>{comment.contenu}</Text>
      <Text style={styles.commentDay}>{formatTimeAgo(comment.created_at)}</Text>
      <View style={styles.commentActions}>

    <TouchableOpacity onPress={() => setEditingComment(comment)}>
      <Image source={require('../assets/edit.png')} style={{ width: 15, height: 15 }} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
      <Image source={require('../assets/poubelle.png')} style={{ width: 15, height: 15 }} />
    </TouchableOpacity>

      </View>
    </View>
  );
})}
      </ScrollView>

      {visibleCommentsCount < comments.length && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={() => setVisibleCommentsCount(visibleCommentsCount + 2)}>
          <Text style={styles.loadMoreText}>Voir plus</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Ajouter un commentaire..."
        value={editingComment ? editingComment.contenu : newComment}
        onChangeText={text => editingComment ? setEditingComment({ ...editingComment, contenu: text }) : setNewComment(text)}
      />
      <TouchableOpacity style={styles.addButton} onPress={editingComment ? handleUpdateComment : handleAddComment}>
        <Text style={styles.addButtonText}>{editingComment ? 'Mettre à jour' : 'Ajouter'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  commentList: {
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  comment: {
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  commentText: {
    fontSize: 16,
  },
  commentUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  commentDay: {
    fontSize: 10,
    color: '#D7A738',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  loadMoreButton: {
    marginTop: 10,
    backgroundColor: '#D7A738',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  loadMoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4A7C87',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommentSection;