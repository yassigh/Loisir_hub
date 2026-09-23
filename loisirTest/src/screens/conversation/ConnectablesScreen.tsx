import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

import {AuthContext} from '../../AuthContext';
import { findConversation, findEntrepriseToAdminConversation } from '../services/conversationService';

const ConnectablesScreen = ({navigation}: any) => {
  const {token} = useContext(AuthContext);
const { userType, entreprise} = useContext(AuthContext);
  interface Connectable {
    id: number;
    first_name?: string;
    last_name?: string;
    nomE?: string;
    logoE?: string; 
    imageU?: string; 
    role?: string; // Ajout de la propriété role
    last_message_date?: string | null; // Ajout de la propriété last_message_date
  }

  const [connectables, setConnectables] = useState<Connectable[]>([]);

  useEffect(() => {
    const fetchConnectables = async () => {
      try {
        const response = await fetch('http://192.168.100.122:8001/api/connectables', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('Connectables data:', data); 
        setConnectables(data);
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des connectables :',
          error,
        );
      }
    };

    fetchConnectables();
  }, [token]);

const handleConnect = async (item: Connectable, receiverType: string) => {
  try {
    let type;
    let adminId = null;
    let entrepriseId = null;
    let userId = null;
    let conversation;

    if (receiverType === 'user' && item.role !== 'admin') {
      // User clique sur un autre user (normal)
      type = 'admin-and-user';
      userId = item.id;
      conversation = await findConversation(userId, entrepriseId, adminId, type, token);
    } else if (receiverType === 'entreprise') {
      // User ou admin clique sur une entreprise
      type = 'user-and-entreprise';
      entrepriseId = item.id;
      conversation = await findConversation(userId, entrepriseId, adminId, type, token);
    } else if (receiverType === 'admin') {
   if (userType === 'entreprise') {
    // Entreprise clique sur admin
    adminId = item.id;
    entrepriseId = entreprise?.id;
    conversation = await findEntrepriseToAdminConversation(adminId, entrepriseId, token);
  } else {
    // User clique sur admin
    type = 'admin-and-user';
    adminId = item.id;
    conversation = await findConversation(userId, entrepriseId, adminId, type, token);
  }
}

    navigation.navigate('ChatScreen', {
      conversationId: conversation.id,
      receiverId: item.id,
      receiverType,
      receiverName: item.nomE || `${item.first_name} ${item.last_name}`,
      receiverLogo: item.logoE || item.imageU,
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
  }
};

  function getFullImageUrl(path: string | null | undefined): string {
    console.log("Chemin de l'image :", path); 
    if (!path) {
      return 'http://192.168.100.122:8001/default-logo.png'; 
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `http://192.168.100.122:8001/storage/${path.replace(/^\/+/, '')}`;
  }
function isRecentMessage(lastMessageDate: string | null | undefined): boolean {
  if (!lastMessageDate) return false;
  const now = new Date();
  const messageDate = new Date(lastMessageDate);
  const diffTime = now.getTime() - messageDate.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays <= 9;
}
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/blanchelogo.png')}
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}> Page de Chat</Text>
      </View>

      <FlatList
        data={connectables}
        keyExtractor={(item, index) =>
    (item.role === 'admin'
      ? `admin-${item.id}`
      : item.nomE
        ? `entreprise-${item.id}`
        : `user-${item.id}`) + '-' + index // index en secours si jamais
  }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
           onPress={() =>
  handleConnect(
    item,
    item.nomE
      ? 'entreprise'
      : item.role === 'admin'
        ? 'admin'
        : 'user'
  )
}>
            <View style={styles.itemContent}>
              {/* Logo ou icône */}
              <Image
                source={{
                  uri: getFullImageUrl(item.imageU || item.logoE), 
                }}
                style={styles.logo}
              />
              {/* Nom */}
        <Text style={styles.itemText}>
  {item.first_name && item.last_name
    ? `${item.first_name} ${item.last_name}`
    : item.nomE}
</Text>
<Text style={styles.roleText}>
  {item.nomE
    ? 'Entreprise'
    : item.role === 'admin'
      ? 'Admin'
      : 'User'} 
</Text>
{isRecentMessage(item.last_message_date) && (
  <Text style={styles.recentMessageText}>il y a un message</Text>
)}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recentMessageText: {
  fontSize: 12,
  color: '#D7A738',
  fontStyle: 'italic',
  marginTop: 2,
},
  roleText: {
  fontSize: 13,
  color: '#888',
  fontStyle: 'italic',
  marginLeft: 5,
},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#4A7C87', 
    borderBottomWidth: 1,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  headerLogo: {
    width: 90,
    height: 30,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subHeader: {
    flexDirection: 'row',

    padding: 16,
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB', 
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#E5E7EB', 
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', 
    flex: 1,
  },
  connectButton: {
    backgroundColor: '#4F46E5', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ConnectablesScreen;
