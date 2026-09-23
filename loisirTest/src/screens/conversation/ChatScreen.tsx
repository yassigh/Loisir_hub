import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {getMessages, sendMessage} from '../services/conversationService';
import {getFullImageUrl} from '../services/imageService';
import {AuthContext} from '../../AuthContext';
const ChatScreen = ({route}: any) => {
  const {token} = useContext(AuthContext);
  const {conversationId, receiverId, receiverType, receiverName, receiverLogo} =
    route.params;
  const [error, setError] = useState('');

  interface Message {
    id: number;
    sender_type: string;
    sender_name: string;
    sender_logo: string;
    content: string;
    created_at: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

 useEffect(() => {
    console.log('conversationId reçu dans ChatScreen :', conversationId);
    console.log('Token utilisé :', token);

    const fetchMessages = async () => {
        try {
            const data = await getMessages(conversationId, token);
            setMessages(data.messages || []);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Erreur lors de la récupération des messages :', (error as any)?.response?.data || error.message);
            } else {
                console.error('Erreur lors de la récupération des messages :', error);
            }
        }
    };

    if (conversationId) {
        fetchMessages();
    } else {
        console.error('conversationId est indéfini ou invalide.');
    }
}, [conversationId, token]);

const handleSendMessage = async () => {
  try {
      const message = await sendMessage(
          receiverId,
          receiverType,
          newMessage,
          token,conversationId
      );
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');
       setError('');
  } catch (error) {
    let msg = "Erreur inconnue";
      if ((error as any)?.response?.data?.error) {
        msg = (error as any).response.data.error;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      setError(msg);
      // Optionnel : efface l'erreur après 4 secondes
      setTimeout(() => setError(''), 4000);
  }
};

  return (
    <View style={styles.container}>
      {/* Header avec le nom et le logo du destinataire */}
      <View style={styles.header}>
        <Image
          source={{
            uri: getFullImageUrl(receiverLogo), 
          }}
          style={styles.logo}
        />
        <Text style={styles.receiverName}>{receiverName}</Text>{' '}
        {/* Utilisez receiverName pour le nom du destinataire */}
        <Image
    source={require('../assets/iconn.png')}
    style={styles.rightIcon}
  />
      </View>
{error ? (
  <View style={styles.alertContainer}>
    <Text style={styles.alertText}>{error}</Text>
  </View>
) : null}
      {/* Liste des messages */}
     <FlatList
  data={messages}
  keyExtractor={item => item.id.toString()}
  renderItem={({item}) => (
    <View
      style={[
        styles.messageItem,
        item.sender_type === 'user'
          ? styles.userMessage
          : item.sender_type === 'admin'
            ? styles.adminMessage
            : styles.entrepriseMessage,
      ]}>
      <Image
        source={{uri: getFullImageUrl(item.sender_logo)}}
        style={styles.messageLogo}
      />
      <View style={styles.messageContentContainer}>
        <Text style={styles.senderName}>{item.sender_name}</Text>
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.messageTime}>
  {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
</Text>
       
      </View>
    </View>
  )}
  ListEmptyComponent={
    <Text style={styles.emptyText}>Aucun message pour le moment.</Text>
  }
/>

      {/* Champ d'entrée pour envoyer un message */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrire un message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
  backgroundColor: '#f8d7da',
  borderRadius: 8,
  padding: 12,
  margin: 12,
  borderWidth: 1,
  borderColor: '#f5c6cb',
  flexDirection: 'row',
  alignItems: 'center',
},
alertText: {
  color: '#721c24',
  fontWeight: 'bold',
  fontSize: 15,
  flex: 1,
},
  adminMessage: {
  alignSelf: 'flex-end',
  backgroundColor: '#e1f5fe',
  borderRadius: 10,
  padding: 10,
  maxWidth: '70%',
},
entrepriseMessage: {
  alignSelf: 'flex-start',
  backgroundColor: '#fff9c4',
  borderRadius: 10,
  padding: 10,
  maxWidth: '70%',
},
  rightIcon: {
    width: 50,
    height: 40,
    marginLeft: 'auto', 
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4A7C87', 
    borderBottomWidth: 1,
    borderBottomColor: '#D7A738',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  receiverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#D7A738', 
    borderRadius: 10,
    padding: 10,
    maxWidth: '70%',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#8EB6AD',
    borderRadius: 10,
    padding: 10,
    maxWidth: '70%',
  },
  messageLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageContentContainer: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A7C87',
  },
  messageContent: {
    fontSize: 16,
    marginVertical: 4,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#F2F2F2',
  },
  sendButton: {
    backgroundColor: '#4A7C87',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
