import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, authApi } from '../services/Api';

interface FlouciKeysFormProps {
  initialValues?: {
    flouci_public_key?: string;
    flouci_secret_key?: string;
    flouci_developer_id?: string;
  };
}

const FlouciKeysForm: React.FC<FlouciKeysFormProps> = ({ initialValues }) => {
  const [publicKey, setPublicKey] = useState(initialValues?.flouci_public_key || '');
  const [secretKey, setSecretKey] = useState(initialValues?.flouci_secret_key || '');
  const [developerId, setDeveloperId] = useState(initialValues?.flouci_developer_id || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Token manquant');

      await authApi.post(
        '/entreprise/flouci-credentials',
        {
          flouci_public_key: publicKey,
          flouci_secret_key: secretKey,
          flouci_developer_id: developerId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Succès', 'Clés Flouci mises à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', "Impossible de mettre à jour les clés Flouci");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modifier mes clés Flouci</Text>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <TextInput
        style={styles.input}
        value={publicKey}
        onChangeText={setPublicKey}
        placeholder="Flouci Public Key"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={secretKey}
        onChangeText={setSecretKey}
        placeholder="Flouci Secret Key"
        autoCapitalize="none"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={developerId}
        onChangeText={setDeveloperId}
        placeholder="Flouci Developer ID"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Enregistrement..." : "Enregistrer"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 30,
  
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginRight: 10,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: '#4A7C87',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FlouciKeysForm;