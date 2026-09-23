import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.122:8001/api'; // Remplacez par l'URL de votre backend

// Récupérer la liste des conversations
export const getConversations = async (token) => {
    const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Créer une nouvelle conversation
export const createConversation = async (type, token) => {
    const response = await axios.post(
        `${API_BASE_URL}/conversations`,
        { type },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Récupérer les messages d'une conversation
export const getMessages = async (conversationId, token) => {
    if (!conversationId) {
        console.error('conversationId est indéfini.');
        throw new Error('conversationId est requis pour récupérer les messages.');
    }

    console.log('Récupération des messages pour la conversation :', conversationId);

    try {
        const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Messages récupérés avec succès :', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des messages :', error.response?.data || error.message);
        throw error;
    }
};

// Envoyer un message
export const sendMessage = async (receiverId, receiverType, content, token, conversationId = null) => {
    const payload = {
        receiver_id: receiverId,
        receiver_type: receiverType,
        content,
    };
    if (conversationId) {
        payload.conversation_id = conversationId;
    }
    const response = await axios.post(
        `${API_BASE_URL}/messages`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};
export const findConversation = async (userId, entrepriseId, adminId, type, token) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/conversations/find`,
           { user_id: userId || null, entreprise_id: entrepriseId || null, admin_id: adminId || null, type },
        { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la recherche de la conversation :', error.response?.data || error.message);
        throw error;
    }
};

export const findEntrepriseToAdminConversation = async (adminId, entrepriseId, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/conversations/entreprise-to-admin`,
      { admin_id: adminId, entreprise_id: entrepriseId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de la conversation entreprise-admin :', error.response?.data || error.message);
    throw error;
  }
};