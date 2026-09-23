import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getConversation, sendMessage } from '../../../services/chatService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatPageAdmin.css';

const ChatPageAdmin = () => {
  const { conversationId } = useParams(); // Récupère l'ID de la conversation depuis l'URL
  const location = useLocation();
  const receiverId = location.state?.receiverId; // Récupère l'ID du destinataire (user ou entreprise)
  const receiverType = location.state?.receiverType; // Récupère le type du destinataire (user ou entreprise)

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
const [errorMsg, setErrorMsg] = useState('');
  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      try {
        const conversation = await getConversation(conversationId); // Appel API pour récupérer la conversation
        console.log('Conversation data:', conversation); // Log des données de la conversation
        console.log('Messages récupérés :', conversation.messages);
        setMessages(conversation.messages || []); // Met à jour les messages
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchConversation();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    console.log('Message à envoyer :', newMessage);

    try {
      const message = await sendMessage(receiverId, newMessage, receiverType); // Envoie le message
      console.log('Message envoyé avec succès :', message);

      setMessages([...messages, message]); // Ajoute le nouveau message à la liste
      setNewMessage('');
    } catch (error) {
  let msg = "Erreur inconnue";
  if (error.response && error.response.data && error.response.data.error) {
    msg = error.response.data.error;
  } else if (error.message) {
    msg = error.message;
  }
  setErrorMsg(msg);
  // Optionnel : efface l'alerte après 4 secondes
  setTimeout(() => setErrorMsg(''), 4000);
}
  };

  return (
    <div className="container mt-4 chat-page">
      <h3 className="text-center mb-4">Conversation</h3>
      {errorMsg && (
  <div className="alert alert-danger" style={{borderRadius: 8, fontWeight: 500, marginBottom: 12}}>
    <i className="bi bi-exclamation-triangle-fill" style={{marginRight: 8}}></i>
    {errorMsg}
  </div>
)}
      <div className="messages border rounded p-3 mb-3" style={{ height: '400px', overflowY: 'auto' }}>
  {loading ? (
    <p className="text-center">Chargement...</p>
  ) : (
    messages.map((msg, index) => (
      <div
        key={index}
        className={`d-flex mb-3 ${
          msg.sender_type === 'admin' ? 'justify-content-end' : 'justify-content-start'
        }`}
      >
        <div
          className={`p-3 rounded ${
            msg.sender_type === 'admin' ? 'bg-primary text-white' : 'bg-light text-dark'
          }`}
          style={{ maxWidth: '70%' }}
        >
          <p className="mb-1">{msg.content}</p>
          <small className="text-muted">
            {new Date(msg.created_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </small>
        </div>
      </div>
    ))
  )}
</div>
            
      <div className="message-input d-flex">
        <input
          type="text"
          className="form-control me-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
        />
        <button className="btn btn-primary" onClick={handleSendMessage}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatPageAdmin;