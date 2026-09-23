import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, Modal, Image } from 'react-native';
import { useTheme } from './ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/Api';

type SettingsScreenNavigationProp = {
  navigate: (screen: 'FlouciKeysForm' | string, params?: object) => void;
};

const Settings = () => {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [entreprise, setEntreprise] = useState<{ email?: string; adresseE?: string } | null>(null);
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const languages = ['English', 'French', 'Arabic', 'Italian'];

  // Récupère les infos entreprise au montage
  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) return;
        const response = await authApi.get('/entreprise/getDetails', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntreprise(response.data);
      } catch (error) {
        setEntreprise(null);
      }
    };
    fetchEntreprise();
  }, []);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Image source={require('../assets/logo.png')} style={styles.logoA} />
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>Paramètres</Text>
      {/* Ligne moderne pour Modifier mes clés Flouci */}
      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => navigation.navigate('FlouciKeysForm')}
      >
        <View style={styles.rowLeft}>
          <Text style={styles.contactText}>Modifier mes clés Flouci                     </Text>
          <Image source={require('../assets/fast-forward.png')} style={styles.logo} />
        </View>
      </TouchableOpacity>

      <Text style={[styles.title, isDarkMode && styles.titleDark]}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={[styles.settingText, isDarkMode && styles.settingTextDark]}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.settingItem}>
        <Text style={[styles.settingText, isDarkMode && styles.settingTextDark]}>Language</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.dropdownText}>{language}</Text>
        </TouchableOpacity>
      </View>

      

      {/* Modal pour la sélection de la langue */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {languages.map((lang) => (
              <TouchableOpacity key={lang} style={styles.modalItem} onPress={() => { setLanguage(lang); setModalVisible(false); }}>
                <Text style={styles.modalText}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
    logoA: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
 container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#222',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    alignSelf: 'flex-start',
  },
  titleDark: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 5,
 

  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
    marginHorizontal: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  settingText: {
    fontSize: 18,
  },
  settingTextDark: {
    color: '#fff',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A7C87',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  contactButton: {
    padding: 15,
    backgroundColor: '#4A7C87',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  contactText: {
   
    fontSize: 18,
  },
  contactCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  contactInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalItem: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
});

export default Settings;
