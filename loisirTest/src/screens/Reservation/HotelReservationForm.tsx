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

interface HotelReservationFormProps {
  activityId: number;
  userId: string;
  onSuccess: () => void;
}

const HotelReservationForm: React.FC<HotelReservationFormProps> = ({ 
  activityId, 
  userId, 
  onSuccess 
}) => {
  const [nbChambre1, setNbChambre1] = useState('');
  const [nbChambre2, setNbChambre2] = useState('');
  const [nbChambre3, setNbChambre3] = useState('');
  const [nbChambre4, setNbChambre4] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [numTel, setNumTel] = useState('');
  const [description, setDescription] = useState('');

  const validateForm = () => {
    if (!dateDebut || !dateFin || !numTel || (!nbChambre1 && !nbChambre2 && !nbChambre3 && !nbChambre4)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires et sélectionner au moins une chambre');
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
        idCategories: 3,
        dateCreationReservation: new Date().toISOString().split('T')[0],
        dateDebut,
        dateFin,
        num_tel: numTel,
        nb_Chambre1: nbChambre1 ? parseInt(nbChambre1, 10) : 0,
        nb_Chambre2: nbChambre2 ? parseInt(nbChambre2, 10) : 0,
        nb_Chambre3: nbChambre3 ? parseInt(nbChambre3, 10) : 0,
        nb_Chambre4: nbChambre4 ? parseInt(nbChambre4, 10) : 0,
        description
      });
      onSuccess();
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Réservation Hôtel</Text>

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
        <Text style={styles.label}>Chambres simples</Text>
        <TextInput
          style={styles.input}
          value={nbChambre1}
          onChangeText={setNbChambre1}
          keyboardType="numeric"
          placeholder="0"
          maxLength={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Chambres doubles</Text>
        <TextInput
          style={styles.input}
          value={nbChambre2}
          onChangeText={setNbChambre2}
          keyboardType="numeric"
          placeholder="0"
          maxLength={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Suites</Text>
        <TextInput
          style={styles.input}
          value={nbChambre3}
          onChangeText={setNbChambre3}
          keyboardType="numeric"
          placeholder="0"
          maxLength={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Chambres familiales</Text>
        <TextInput
          style={styles.input}
          value={nbChambre4}
          onChangeText={setNbChambre4}
          keyboardType="numeric"
          placeholder="0"
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
  required: {
      color: 'red', // Couleur rouge pour les étoiles
    },
    requiredNote: {
      marginTop: 16,
    },
    requiredText: {
      fontSize: 12,
      color: '#999',
    },

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
modalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 16,
  maxHeight: '80%',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 16,
  textAlign: 'center',
},
timeList: {
  maxHeight: 300,
},
timeItem: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
timeText: {
  fontSize: 16,
  color: '#333',
},
selectedTimeText: {
  color: '#4A7C87',
  fontWeight: 'bold',
},
closeButton: {
  marginTop: 16,
  padding: 16,
  backgroundColor: '#4A7C87',
  borderRadius: 8,
  alignItems: 'center',
},
closeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
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
placeholder: {
  color: '#999',
},
inputText: {
  color: '#333',
},
});

export default HotelReservationForm;