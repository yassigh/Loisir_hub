import { authApi } from './api'; // Utilisez l'importation nommée

export const getConnectedUsers = async () => {
    try {
      const response = await authApi.get('/connectables'); // Appel API pour récupérer les utilisateurs connectés
      return response.data; // Retourne directement les données
    } catch (error) {
      console.error('Error fetching connected users:', error);
      throw error;
    }
  };

  export const getConversation = async (conversationId) => {
    try {
      const response = await authApi.get(`/conversations/${conversationId}`); // Appel API pour récupérer une conversation
      console.log('Messages récupérés :', response.data); // Log pour débogage
      return response.data; // Retourne les données de la conversation
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  };
export const sendMessageWithConversationId = async (conversationId, content) => {
  try {
    const payload = {
      conversation_id: parseInt(conversationId, 10),
      content,
    };
    console.log('Données envoyées à l\'API /messages :', payload);

    const response = await authApi.post('/messages', payload);
    console.log('Réponse reçue de l\'API /messages :', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
  export const sendMessage = async (receiverId, content, receiverType = 'user') => {
    try {
      const payload = {
        receiver_id: parseInt(receiverId, 10), // Convertir en entier
        content,
        receiver_type: receiverType,
      };
  
      console.log('Données envoyées à l\'API /messages :', payload);
  
      const response = await authApi.post('/messages', payload);
  
      console.log('Réponse reçue de l\'API /messages :', response.data);
      return response.data; // Retourne le message envoyé
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Relance l'erreur pour la gérer dans le front-end
    }
  };
  // export const findOrCreateConversation = async (userId, receiverType) => {
  //   try {
  //     console.log('Données envoyées pour trouver ou créer une conversation :', {
  //       user_id: userId,
  //       receiver_type: receiverType,
  //     });
  
  //     const response = await authApi.post('/conversations/find', {
  //       user_id: userId,
  //       receiver_type: receiverType,
  //     });
  
  //     console.log('Conversation trouvée ou créée :', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Erreur lors de la recherche ou de la création de la conversation :', error);
  //     throw error;
  //   }
  // };
  export const findOrCreateConversation = async (receiverId, receiverType) => {
    try {
      const payload = {
        user_id: receiverType === 'user' ? receiverId : null,
        entreprise_id: receiverType === 'entreprise' ? receiverId : null,
      };
  
      console.log('Payload envoyé à l\'API :', payload);
  
      const response = await authApi.post('/conversations/find', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche ou de la création de la conversation :', error);
      throw error;
    }
  };
  export const findOrCreateEntrepriseToAdminConversation = async (adminId, entrepriseId) => {
  try {
    const payload = {
      admin_id: adminId,
      entreprise_id: entrepriseId,
    };
    console.log('Payload envoyé à l\'API (entreprise-to-admin):', payload);
    const response = await authApi.post('/conversations/entreprise-to-admin', payload);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche ou de la création de la conversation entreprise-admin :', error);
    throw error;
  }
};
  export const findOrCreateConversationA = async (receiverId, receiverType) => {
    try {
      const payload = {
        user_id: receiverType === 'user' ? receiverId : null,
        entreprise_id: receiverType === 'entreprise' ? receiverId : null,
      };
  
      console.log('Payload envoyé à l\'API :', payload);
  
      const response = await authApi.post('/conversations', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche ou de la création de la conversation :', error);
      throw error;
    }
  };