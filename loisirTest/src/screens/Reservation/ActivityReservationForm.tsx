import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  Platform 
} from 'react-native';
import { createReservation } from '../services/reservationService';
import { useNavigation } from '@react-navigation/native';

interface ActivityReservationFormProps {
  activityId: number;
  userId: string;
  onSuccess: () => void;
}

const ActivityReservationForm: React.FC<ActivityReservationFormProps> = ({ 
  activityId, 
  userId, 
  onSuccess 
}) => {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [duree, setDuree] = useState('1');
  const [numTel, setNumTel] = useState('');
  const [description, setDescription] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [heureFin, setHeureFin] = useState('');

  const heures = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour}:${minutes}`;
  });

  const validateForm = () => {
    if (!dateDebut || !dateFin || !heureDebut || !heureFin || !numTel) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const [hours, minutes] = heureDebut.split(':');
    const durationInHours = parseInt(duree);
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + durationInHours * 60;
    const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endMinutes = (totalMinutes % 60).toString().padStart(2, '0');
    const heureFin = `${endHours}:${endMinutes}`;
      await createReservation({
        id_Act: activityId,
        user_id: userId,
        idCategories: 1,
        dateCreationReservation: new Date().toISOString().split('T')[0],
        dateDebut,
        dateFin,
        num_tel: numTel,
        heureDebut,
      heureFin,
        duree: parseInt(duree, 10),
       
        description,
      });
      onSuccess();
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Réservation</Text>

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
        <Text style={styles.label}>Heure de début <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimeModal(true)}
        >
          <Text style={heureDebut ? styles.inputText : styles.placeholder}>
            {heureDebut || "Sélectionnez l'heure"}
          </Text>
        </TouchableOpacity>
      </View>
<View style={styles.formGroup}>
  <Text style={styles.label}>Heure de fin <Text style={styles.required}>*</Text></Text>
  <TextInput
    style={styles.input}
    value={heureFin}
    onChangeText={setHeureFin}
    placeholder="HH:mm"
    keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
  />
</View>
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir l'heure</Text>
            <ScrollView style={styles.timeList}>
              {heures.map((heure) => (
                <TouchableOpacity
                  key={heure}
                  style={styles.timeItem}
                  onPress={() => {
                    setHeureDebut(heure);
                    setShowTimeModal(false);
                  }}
                >
                  <Text style={[
                    styles.timeText,
                    heureDebut === heure && styles.selectedTimeText
                  ]}>
                    {heure}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Durée (en heures) <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={duree}
          onChangeText={setDuree}
          keyboardType="numeric"
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
      <View style={{ marginTop: 16 }}>
  <Text style={{ fontSize: 12, color: '#999' }}>
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

export default ActivityReservationForm;