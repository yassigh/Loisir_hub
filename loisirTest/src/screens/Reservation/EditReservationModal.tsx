import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { updateReservation } from '../services/reservationService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from 'react-native';
import { getReservationById } from '../services/reservationService';

interface ReservationData {
  id_Res: number;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  num_tel: string;
  nbPersonnes: number;
  description: string;
  montant: number;
  etat: string;
  nombreSeances?: number;
}

interface EditReservationModalProps {
  isVisible: boolean;
  reservation: ReservationData;
  onClose: () => void;
  onUpdate: () => void;
}

const EditReservationModal = ({
  isVisible,
  reservation,
  onClose,
  onUpdate,
}: EditReservationModalProps) => {
  const [dateDebut, setDateDebut] = useState(new Date(reservation.dateDebut + 'T' + (reservation.heureDebut || '00:00')));
  const [dateFin, setDateFin] = useState(new Date(reservation.dateFin + 'T' + (reservation.heureFin || '00:00')));
  const [heureDebut, setHeureDebut] = useState(new Date('2024-01-01T' + (reservation.heureDebut || '00:00')));
  const [heureFin, setHeureFin] = useState(new Date('2024-01-01T' + (reservation.heureFin || '00:00')));
  const [numTel, setNumTel] = useState(reservation.num_tel || '');
  const [nbPersonnes, setNbPersonnes] = useState(reservation.nbPersonnes?.toString() || '1');
  const [nombreSeances, setNombreSeances] = useState(reservation.nombreSeances?.toString() || '1');
  const [description, setDescription] = useState(reservation.description || '');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentField, setCurrentField] = useState<'dateDebut' | 'dateFin' | 'heureDebut' | 'heureFin'>('dateDebut');

useEffect(() => {
  setDateDebut(new Date(reservation.dateDebut + 'T' + (reservation.heureDebut || '00:00')));
  setDateFin(new Date(reservation.dateFin + 'T' + (reservation.heureFin || '00:00')));
  setHeureDebut(new Date('2024-01-01T' + (reservation.heureDebut || '00:00')));
  setHeureFin(new Date('2024-01-01T' + (reservation.heureFin || '00:00')));
  setNumTel(reservation.num_tel || '');
  setNbPersonnes(reservation.nbPersonnes?.toString() || '1');
  setNombreSeances(reservation.nombreSeances?.toString() || '1');
  setDescription(reservation.description || '');
}, [reservation]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      switch (currentField) {
        case 'dateDebut':
          setDateDebut(selectedDate);
          break;
        case 'dateFin':
          setDateFin(selectedDate);
          break;
        case 'heureDebut':
          setHeureDebut(selectedDate);
          break;
        case 'heureFin':
          setHeureFin(selectedDate);
          break;
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await updateReservation(reservation.id_Res, {
        dateDebut: dateDebut.toISOString().split('T')[0],
        dateFin: dateFin.toISOString().split('T')[0],
        heureDebut: formatTime(heureDebut),
        heureFin: formatTime(heureFin),
        num_tel: numTel,
        nbPersonnes: parseInt(nbPersonnes),
        nombreSeances: parseInt(nombreSeances),
        description: description,
      });
      Alert.alert('Succès', 'Réservation modifiée avec succès');
      onUpdate();
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la modification');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
     
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>   <ScrollView
    contentContainerStyle={{ paddingBottom: 20 }}
    showsVerticalScrollIndicator={false}
  >
          <Text style={styles.modalTitle}>Modifier la réservation</Text>

          <Text style={styles.label}>Date de début</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setCurrentField('dateDebut');
              setPickerMode('date');
              setShowPicker(true);
            }}
          >
            <Text>{dateDebut.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Heure de début</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setCurrentField('heureDebut');
              setPickerMode('time');
              setShowPicker(true);
            }}
          >
            <Text>{formatTime(heureDebut)}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Date de fin</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setCurrentField('dateFin');
              setPickerMode('date');
              setShowPicker(true);
            }}
          >
            <Text>{dateFin.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Heure de fin</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setCurrentField('heureFin');
              setPickerMode('time');
              setShowPicker(true);
            }}
          >
            <Text>{formatTime(heureFin)}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            value={numTel}
            onChangeText={setNumTel}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Nombre de personnes</Text>
          <TextInput
            style={styles.input}
            value={nbPersonnes}
            onChangeText={setNbPersonnes}
            placeholder="Nombre de personnes"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Nombre de séances</Text>
          <TextInput
            style={styles.input}
            value={nombreSeances}
            onChangeText={setNombreSeances}
            placeholder="Nombre de séances"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />

          {showPicker && (
            <DateTimePicker
              value={
                currentField === 'dateDebut' ? dateDebut :
                currentField === 'dateFin' ? dateFin :
                currentField === 'heureDebut' ? heureDebut : heureFin
              }
              mode={pickerMode}
              onChange={onDateChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity><View style={{ height: 50}}></View>
          </View>      </ScrollView>
        </View>
      </View>

    </Modal>
  );
};

const styles = StyleSheet.create({
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A7C87',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#4A7C87',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditReservationModal;