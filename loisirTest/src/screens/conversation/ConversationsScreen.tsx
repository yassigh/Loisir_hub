import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { AuthContext } from '../../AuthContext';
import { getConversations } from '../services/conversationService';

const ConversationsScreen = ({ navigation }: any) => {
    const { token } = useContext(AuthContext); 
    interface Conversation {
        id: number;
        user_id?: number;
        entreprise_id?: number;
        user?: {
            first_name: string;
            last_name: string;
            logo?: string; 
        };
        entreprise?: {
            nomE: string;
            logo?: string; 
        };
        sender_type?: 'user' | 'entreprise';
        content?: string; 
        created_at?: string;
    }

    const [conversations, setConversations] = useState<Conversation[]>([]);


    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getConversations(token);
                console.log('Conversations récupérées :', data);
                setConversations(data);
            } catch (error) {
                console.error('Erreur lors de la récupération des conversations :', error);
            }
        };
    
        fetchConversations();
    }, [token]);
    function getFullImageUrl(path: string | null | undefined): string {
        console.log('Chemin de l\'image :', path);
        if (!path) {
          return 'http://192.168.100.122:8001/default-logo.png';
        }
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return path;
        }
        return `http://192.168.100.122:8001/storage/${path.replace(/^\/+/, '')}`; 
      }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Conversations</Text>
            <FlatList
  data={conversations}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View
      style={[
        styles.messageItem,
        item.sender_type === 'user' ? styles.userMessageContainer : styles.receiverMessageContainer,
      ]}
    >
      {/* Logo de l'expéditeur */}
      {item.sender_type === 'user' ? (
        <Image
          source={{ uri: getFullImageUrl(item.user?.logo) }} 
          style={styles.messageLogo}
        />
      ) : (
        <Image
          source={{ uri: getFullImageUrl(item.entreprise?.logo) }}
          style={styles.messageLogo}
        />
      )}

      {/* Contenu du message */}
      <View
        style={[
          styles.messageBubble,
          item.sender_type === 'user' ? styles.userMessage : styles.receiverMessage,
        ]}
      >
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'N/A'}
        </Text>
      </View>
    </View>
  )}
  ListEmptyComponent={<Text style={styles.emptyText}>Aucun message pour le moment.</Text>}
/>
        </View>
    );
};

const styles = StyleSheet.create({
    itemText: {
        fontSize: 16,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    conversationItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    conversationText: {
        fontSize: 16,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 8,
        paddingHorizontal: 16,
      },
      userMessageContainer: {
        flexDirection: 'row-reverse', 
      },
      receiverMessageContainer: {
        flexDirection: 'row', 
      },
      messageLogo: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 10,
      },
      messageBubble: {
        maxWidth: '70%',
        borderRadius: 10,
        padding: 10,
      },
      userMessage: {
        backgroundColor: '#D7A738', 
        alignSelf: 'flex-end',
      },
      receiverMessage: {
        backgroundColor: '#8EB6AD', 
        alignSelf: 'flex-start',
      },
      messageContent: {
        fontSize: 16,
        color: '#000',
      },
      messageTime: {
        fontSize: 12,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 5,
      },
      emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
      },
});

export default ConversationsScreen;