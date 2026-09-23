import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  Platform 
} from 'react-native';
import { createReservation } from '../services/reservationService';

interface CulturelleFormProps {
  activityId: number;
  userId: string;
  onSuccess: () => void;
}

const CulturelleForm: React.FC<CulturelleFormProps> = ({ 
  activityId, 
  userId, 
  onSuccess 
}) => {
  const [nbPersonnes, setNbPersonnes] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [numTel, setNumTel] = useState('');
  const [description, setDescription] = useState('');

  const validateForm = () => {
    if (!dateDebut || !dateFin || !numTel || !nbPersonnes) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createReservation({
        id_Act: activityId,
        user_id: userId,
        idCategories: 2,
        dateCreationReservation: new Date().toISOString().split('T')[0],
        dateDebut,
        dateFin,
        num_tel: numTel,
        nbPersonnes: parseInt(nbPersonnes, 10),
        description
      });
      onSuccess();
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Réservation Culturelle</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date de début <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={dateDebut}
          onChangeText={setDateDebut}
          placeholder="YYYY-MM-DD"
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date de fin <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={dateFin}
          onChangeText={setDateFin}
          placeholder="YYYY-MM-DD"
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre de personnes <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={nbPersonnes}
          onChangeText={setNbPersonnes}
          keyboardType="numeric"
          placeholder="Nombre de personnes"
          maxLength={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Numéro de téléphone <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={numTel}
          onChangeText={setNumTel}
          keyboardType="phone-pad"
          placeholder="+216 11 111 111"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="Ajouter une note (optionnel)"
        />
      </View>

      <View style={styles.requiredNote}>
        <Text style={styles.requiredText}>
          <Text style={styles.required}>*</Text> Champs obligatoires
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Réserver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Copy the same styles from ActivityReservationForm
  // ...existing styles from ActivityReservationForm...
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  required: {
    color: 'red',
  },
  requiredNote: {
    marginTop: 16,
  },
  requiredText: {
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#4A7C87',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CulturelleForm;