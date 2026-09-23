import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createReservation } from '../services/reservationService';

interface ReservationFormProps {
  activityId: number;
  userId: string;
  onSuccess: () => void;
  activity: {
    heure: number;
    minute: number;
    jours: number;
    entreprise_id: number;
    prixP: string;
    offreP?: string; // Ajout de l'offre ici
    dureeBase?: {
      heures: number;
      minutes: number;
    };
  };
}

const ReservationForm = ({ activityId, userId, onSuccess, activity }: ReservationFormProps) => {
  const [dateDebut, setDateDebut] = useState(new Date());
  const [heureDebut, setHeureDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [nbPersonnes, setNbPersonnes] = useState('1');
  const [numTel, setNumTel] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentPicker, setCurrentPicker] = useState<'debut' | 'fin'>('debut');
  const [montantTotal, setMontantTotal] = useState<number>(
    parseFloat(activity.prixP?.toString() || '0')
  );
  const [nombreSeances, setNombreSeances] = useState('1');



  //v3.0
  const calculerMontantTotal = useCallback(() => {
    const nombreSeancesNum = parseInt(nombreSeances) || 1;
    const prixBase = parseFloat(activity.prixP); // Convertir le string en number
    const offrePercent = activity.offreP ? parseFloat(activity.offreP) : 0;

    let prixUnitaire = prixBase;
    if (offrePercent > 0) {
      const reduction = (prixBase * offrePercent) / 100;
      prixUnitaire = prixBase - reduction;
    }

    return prixUnitaire * nombreSeancesNum;
  }, [nombreSeances, activity.prixP, activity.offreP]);
  //v2.0
  // const calculerMontantTotal = useCallback(() => {
  //   const nombreSeancesNum = parseInt(nombreSeances) || 1;
  //   const prixBase = parseFloat(activity.prixP?.toString() || '0');
  //   const offrePercent = parseFloat(activity.offreP?.toString() || '0');

  //   let prixUnitaire = prixBase;
  //   if (offrePercent > 0) {
  //     const reduction = (prixBase * offrePercent) / 100;
  //     prixUnitaire = prixBase - reduction;
  //   }

  //   return prixUnitaire * nombreSeancesNum;
  // }, [nombreSeances, activity.prixP, activity.offreP]);
  //v1.0
  // const calculerMontantTotal = useCallback(() => {
  //   const nombreSeancesNum = parseInt(nombreSeances) || 1;
  //   const prixBase = parseFloat(activity.prixP?.toString() || '0');
  //   const offrePercent = parseFloat(activity.offreP?.toString() || '0');

  //   let prixUnitaire = prixBase;
  //   if (offrePercent > 0) {
  //     const reduction = (prixBase * offrePercent) / 100;
  //     prixUnitaire = prixBase - reduction;
  //   }

  //   return prixUnitaire * nombreSeancesNum;
  // }, [nombreSeances, activity.prixP, activity.offreP]);

  //v4.0
  useEffect(() => {
    if (dateDebut && heureDebut) {
      const fin = new Date(dateDebut);
      const nombreSeancesNum = parseInt(nombreSeances) || 1;

      if (activity.jours > 0) {
        // Si l'activité est mesurée en jours (ex: abonnement)
        fin.setDate(fin.getDate() + (activity.jours * nombreSeancesNum));
      } else {
        // Si l'activité est mesurée en heures/minutes
        const dureeMinutesBase = (activity?.heure || 0) * 60 + (activity?.minute || 0);
        const dureeTotaleMinutes = dureeMinutesBase * nombreSeancesNum;
        fin.setMinutes(fin.getMinutes() + dureeTotaleMinutes);
      }
      setDateFin(fin);

      // Mettre à jour le montant total
      setMontantTotal(calculerMontantTotal());
    }
  }, [dateDebut, heureDebut, nombreSeances, activity, calculerMontantTotal]);
  useEffect(() => {
    const newTotal = calculerMontantTotal();
    setMontantTotal(newTotal);
  }, [calculerMontantTotal, nombreSeances, activity.prixP, activity.offreP]);
  //v3.0
  // useEffect(() => {
  //   if (dateDebut && heureDebut) {
  //     const fin = new Date(dateDebut);
  //     const nombreSeancesNum = parseInt(nombreSeances) || 1;

  //     // Calcul de la durée de base en minutes pour une séance
  //     const dureeMinutesBase = (activity?.heure || 0) * 60 + (activity?.minute || 0);

  //     // Durée totale en minutes pour toutes les séances
  //     const dureeTotaleMinutes = dureeMinutesBase * nombreSeancesNum;

  //     if (dureeTotaleMinutes > 0) {
  //       fin.setMinutes(fin.getMinutes() + dureeTotaleMinutes);
  //       setDateFin(fin);
  //     }
  //   }
  // }, [dateDebut, heureDebut, nombreSeances, activity]);
  //v2.0
  // useEffect(() => {
  //   if (dateDebut && heureDebut) {
  //     const fin = new Date(dateDebut);

  //     // Calcul de la durée de base en minutes
  //     const dureeMinutesBase = (activity?.jours || 0) * 24 * 60 +
  //       (activity?.heure || 0) * 60 +
  //       (activity?.minute || 0);

  //     if (dureeMinutesBase > 0) {
  //       fin.setMinutes(fin.getMinutes() + dureeMinutesBase);
  //       setDateFin(fin);
  //     }
  //   }
  // }, [dateDebut, heureDebut, activity]);
  // useEffect(() => {
  //   const nouveauMontant = calculerMontantTotal();
  //   setMontantTotal(nouveauMontant);
  // }, [nombreSeances, activity.prixP]);


  // Modifier la fonction de calcul du montant
  //v3.0

  //v2.0
  // const calculerMontantTotal = useCallback(() => {
  //   const nombreSeancesNum = parseInt(nombreSeances) || 1;

  //   if (activity.jours > 0 && !activity.heure && !activity.minute) {
  //     // Pour les abonnements
  //     return activity.prixP * nombreSeancesNum;
  //   } else {
  //     // Pour les activités normales
  //     return activity.prixP * nombreSeancesNum;
  //   }
  // }, [nombreSeances, activity]);
  //v1.0
  // useEffect(() => {

  //   if (dateDebut && heureDebut && nbPersonnes) {
  //     const fin = new Date(dateDebut);
  //     const nombreReservations = parseInt(nbPersonnes);

  //     // Conversion des durées en minutes avec des valeurs par défaut
  //     const dureeMinutesBase = (activity?.jours || 0) * 24 * 60 +
  //       (activity?.heure || 0) * 60 +
  //       (activity?.minute || 0);

  //     if (dureeMinutesBase > 0) {
  //       // Calcul de la durée totale
  //       const dureeMinutesTotale = dureeMinutesBase * nombreReservations;

  //       // Ajout des minutes à la date de début
  //       fin.setMinutes(fin.getMinutes() + dureeMinutesTotale);
  //       setDateFin(fin);
  //     }
  //   }
  //   setMontantTotal(calculerMontantTotal());
  // }, [dateDebut, heureDebut, nbPersonnes, activity]);

  // const calculerMontantTotal = useCallback(() => {
  //   if (!dateDebut || !dateFin || !nbPersonnes) return activity.prixP;

  //   // Convertir toutes les durées en minutes
  //   const dureeBaseMinutes = 
  //     (activity.jours || 0) * 24 * 60 + // Jours en minutes
  //     (activity.heure || 0) * 60 +      // Heures en minutes
  //     (activity.minute || 0);           // Minutes

  //   // Si c'est un abonnement (durée en jours uniquement)
  //   if (activity.jours > 0 && !activity.heure && !activity.minute) {
  //     const nombreMois = parseInt(nbPersonnes);
  //     return activity.prixP * nombreMois;
  //   }

  //   // Pour les activités normales
  //   if (dureeBaseMinutes > 0) {
  //     const dureeReservationMinutes = Math.abs(dateFin.getTime() - dateDebut.getTime()) / (1000 * 60);
  //     const ratio = Math.ceil(dureeReservationMinutes / dureeBaseMinutes);
  //     return activity.prixP * ratio;
  //   }

  //   return activity.prixP;
  // }, [dateDebut, dateFin, nbPersonnes, activity]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    setShowTimePicker(false);

    //v2.0
    if (!selectedDate) return;

    if (pickerMode === 'date') {
      const newDate = new Date(selectedDate);
      if (currentPicker === 'debut') {
        newDate.setHours(heureDebut.getHours(), heureDebut.getMinutes());
        setDateDebut(newDate);

        // Mettre à jour automatiquement la date de fin
        const finDate = new Date(newDate);
        if (activity.jours) {
          finDate.setDate(finDate.getDate() + (activity.jours * parseInt(nbPersonnes)));
        } else {
          const dureeMinutes = ((activity.heure || 0) * 60 + (activity.minute || 0)) * parseInt(nbPersonnes);
          finDate.setMinutes(finDate.getMinutes() + dureeMinutes);
        }
        setDateFin(finDate);
      } else if (currentPicker === 'fin') {
    newDate.setHours(dateFin.getHours(), dateFin.getMinutes());
    setDateFin(newDate);}
  } else if (pickerMode === 'time') {
    if (currentPicker === 'debut') {
      const newDate = new Date(dateDebut);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setHeureDebut(newDate);
      setDateDebut(newDate);

      // Mettre à jour l'heure de fin
      const finDate = new Date(newDate);
      const dureeMinutes = ((activity.heure || 0) * 60 + (activity.minute || 0)) * parseInt(nbPersonnes);
        finDate.setMinutes(finDate.getMinutes() + dureeMinutes);
        setDateFin(finDate);
      } else if (currentPicker === 'fin') {
    const newDate = new Date(dateFin);
    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    setDateFin(newDate);
  }
    }
  };
  //v1.0
  //   if (selectedDate) {
  //     if (pickerMode === 'date') {
  //       if (currentPicker === 'debut') {
  //         const newDate = new Date(selectedDate);
  //         newDate.setHours(heureDebut.getHours(), heureDebut.getMinutes());
  //         setDateDebut(newDate);
  //       }
  //     } else if (pickerMode === 'time') {
  //       if (currentPicker === 'debut') {
  //         const newDate = new Date(dateDebut);
  //         newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
  //         setHeureDebut(newDate);
  //         setDateDebut(newDate);
  //       }
  //     }
  //   }
  // };

  const showPicker = (mode: 'date' | 'time', type: 'debut' | 'fin') => {
    setPickerMode(mode);
    setCurrentPicker(type);
    if (mode === 'date') {
      setShowDatePicker(true);
    } else {
      setShowTimePicker(true);
    }
  };

  //v5.0
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const debut = new Date(dateDebut);
      debut.setHours(heureDebut.getHours(), heureDebut.getMinutes());

      const fin = new Date(dateFin);
      // Calculate end time based on duration and number of sessions
      const dureeMinutes = (activity.heure || 0) * 60 + (activity.minute || 0);
      const totalDureeMinutes = dureeMinutes * parseInt(nombreSeances);
      fin.setTime(debut.getTime() + totalDureeMinutes * 60 * 1000);

      const reservationData = {
        id_Act: activityId,
        user_id: userId,
        dateCreationReservation: new Date().toISOString().split('T')[0],
        dateDebut: debut.toISOString().split('T')[0],
        dateFin: fin.toISOString().split('T')[0],
        heureDebut: formatTime(debut),
        heureFin: formatTime(fin),
        num_tel: numTel,
        nbPersonnes: parseInt(nbPersonnes),
        nombreSeances: parseInt(nombreSeances),
        description: description || '',
        entreprise_id: activity.entreprise_id,
        montant: calculerMontantTotal(),
        duree: calculerDuree(debut, fin)
      };

      console.log('Sending reservation data:', reservationData);
      const response = await createReservation(reservationData);
      onSuccess();
      Alert.alert('Succès', 'Réservation créée avec succès');
    } catch (error: any) {
      console.error('Reservation error:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.error || 'Une erreur est survenue lors de la création de la réservation'
      );
    }
  };
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const calculerDuree = (debut: Date, fin: Date): number => {
    const diffMs = Math.abs(fin.getTime() - debut.getTime());
    return Math.ceil(diffMs / (1000 * 60 * 60)); // Convert to hours
  };
  //v4.0
  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   try {
  //     const reservationData = {
  //       id_Act: activityId,
  //       user_id: userId,
  //       dateCreationReservation: new Date().toISOString().split('T')[0],
  //       dateDebut: dateDebut.toISOString().split('T')[0],
  //       dateFin: dateFin.toISOString().split('T')[0],
  //       heureDebut: formatTime(heureDebut),
  //       heureFin: formatTime(dateFin),
  //       num_tel: numTel,
  //       nbPersonnes: 1,
  //       nombreSeances: parseInt(nombreSeances),
  //       description: description || '',
  //       entreprise_id: activity.entreprise_id,
  //       montant: calculerMontantTotal(),
  //       duree: calculerDuree(dateDebut, dateFin)
  //     };

  //     console.log('Sending reservation data:', reservationData);
  //     const response = await createReservation(reservationData);
  //     onSuccess();
  //     Alert.alert('Succès', 'Réservation créée avec succès');
  //   } catch (error: any) {
  //     console.error('Reservation error:', error);
  //     Alert.alert(
  //       'Erreur',
  //       error.response?.data?.error || 'Une erreur est survenue lors de la création de la réservation'
  //     );
  //   }
  // };
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // const formatTime = (date: Date): string => {
  //   return date.toLocaleTimeString('fr-FR', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false
  //   });
  // };

  //v2.0
  // const calculerDuree = (debut: Date, fin: Date): number => {
  //   if (activity.jours > 0) {
  //     // Pour les abonnements en jours
  //     return activity.jours * parseInt(nombreSeances);
  //   } else {
  //     // Pour les activités en heures/minutes
  //     const dureeBaseMinutes = (activity.heure || 0) * 60 + (activity.minute || 0);
  //     const dureeParSeance = Math.ceil(dureeBaseMinutes / 60); // Convertir en heures
  //     return dureeParSeance * parseInt(nombreSeances);
  //   }
  // };
  //v1.0
  // const calculerDuree = (debut: Date, fin: Date): number => {
  //   if (activity.jours > 0) {
  //     return activity.jours * parseInt(nombreSeances);
  //   }

  //   const diffMs = Math.abs(fin.getTime() - debut.getTime());
  //   const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  //   return hours;
  // };
  //v3.0
  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   try {
  //     const today = new Date();
  //     const reservationData = {
  //       id_Act: activityId,
  //       user_id: userId,
  //       dateCreationReservation: today.toISOString().split('T')[0],
  //       dateDebut: dateDebut.toISOString().split('T')[0],
  //       dateFin: dateFin.toISOString().split('T')[0],
  //       heureDebut: heureDebut.toLocaleTimeString('fr-FR', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: false
  //       }),
  //       heureFin: dateFin.toLocaleTimeString('fr-FR', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: false
  //       }),
  //       num_tel: numTel,
  //       nbPersonnes: 1, // Nombre fixe de personnes
  //       nombreSeances: parseInt(nombreSeances), // Nouveau champ
  //       description: description,
  //       entreprise_id: activity.entreprise_id,
  //       montant: montantTotal,
  //       duree: calculerDureeEnHeures(dateDebut, dateFin)
  //     };

  //     console.log('Sending reservation data:', reservationData);
  //     const response = await createReservation(reservationData);
  //     onSuccess();
  //     Alert.alert('Succès', 'Réservation créée avec succès');
  //   } catch (error) {
  //     console.error('Reservation error:', error);
  //     Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la réservation');
  //   }
  // };
  //v2.0
  //   const handleSubmit = async () => {
  //     if (!validateForm()) return;

  //     try {
  //         const today = new Date().toISOString().split('T')[0];

  //         const reservationData = {
  //             id_Act: activityId,
  //             user_id: userId,
  //             dateCreationReservation: today,
  //             dateDebut: dateDebut.toISOString().split('T')[0],
  //             dateFin: dateFin.toISOString().split('T')[0],
  //             heureDebut: heureDebut.toLocaleTimeString('fr-FR', { 
  //                 hour: '2-digit', 
  //                 minute: '2-digit',
  //                 hour12: false 
  //             }),
  //             heureFin: dateFin.toLocaleTimeString('fr-FR', {
  //                 hour: '2-digit',
  //                 minute: '2-digit',
  //                 hour12: false
  //             }),
  //             duree: calculerDureeEnHeures(dateDebut, dateFin),
  //             num_tel: numTel,
  //             nbPersonnes: parseInt(nbPersonnes),
  //             description: description,
  //             entreprise_id: activity.entreprise_id,
  //         };

  //         console.log('Sending reservation data:', reservationData);

  //         const response = await createReservation(reservationData);
  //         onSuccess();
  //         Alert.alert('Succès', 'Réservation créée avec succès');
  //     } catch (error) {
  //         console.error('Reservation error:', error);
  //         Alert.alert(
  //             'Erreur',
  //             'Une erreur est survenue lors de la création de la réservation'
  //         );
  //     }
  // };
  //v1.0
  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   try {
  //     // Formatter les dates pour MySQL (YYYY-MM-DD HH:mm:ss)
  //     const formatDateForMySQL = (date: Date) => {
  //       return date.toISOString().slice(0, 19).replace('T', ' ');
  //     };

  //     const today = new Date();
  //     const reservationData = {
  //       id_Act: activityId,
  //       user_id: userId,
  //       dateCreationReservation: formatDateForMySQL(today),
  //       dateDebut: formatDateForMySQL(dateDebut),
  //       dateFin: formatDateForMySQL(dateFin),
  //       heureDebut: heureDebut.toLocaleTimeString().slice(0, 5),
  //       heureFin: dateFin.toLocaleTimeString().slice(0, 5),
  //       duree: calculerDureeEnHeures(dateDebut, dateFin),
  //       num_tel: numTel,
  //       nbPersonnes: parseInt(nbPersonnes),
  //       description: description,
  //       entreprise_id: activity.entreprise_id, // Assurez-vous que cette prop existe
  //       montant: activity.prixP, // Assurez-vous que cette prop existe
  //       etat: 'en attente'
  //     };

  //     await createReservation(reservationData);
  //     onSuccess();
  //     Alert.alert('Succès', 'Réservation créée avec succès');
  //   } catch (error) {
  //     console.error('Reservation error:', error);
  //     Alert.alert(
  //       'Erreur',
  //       'Une erreur est survenue lors de la création de la réservation'
  //     );
  //   }
  // };

  const validateForm = () => {
    if (!dateDebut || !dateFin || !numTel || !nbPersonnes) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }

    // Validation supplémentaire du format de téléphone
    const phoneRegex = /^\+216[0-9]{8}$/;
    if (!phoneRegex.test(numTel)) {
      Alert.alert('Erreur', 'Le numéro de téléphone doit être au format +216XXXXXXXX');
      return false;
    }

    return true;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Réservation</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date de début <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => showPicker('date', 'debut')}
        >
          <Text style={styles.dateButtonText}>
            {dateDebut.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Heure de début */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Heure de début <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => showPicker('time', 'debut')}
        >
          <Text style={styles.dateButtonText}>
            {heureDebut.toLocaleTimeString().slice(0, 5)}
          </Text>
        </TouchableOpacity>
      </View>
      
<View style={styles.formGroup}>
  <Text style={styles.label}>Date de fin <Text style={styles.required}>*</Text></Text>
  <TouchableOpacity
    style={styles.dateButton}
    onPress={() => showPicker('date', 'fin')}
  >
    <Text style={styles.dateButtonText}>
      {dateFin.toLocaleDateString()}
    </Text>
  </TouchableOpacity>
</View>
<View style={styles.formGroup}>
  <Text style={styles.label}>Heure de fin <Text style={styles.required}>*</Text></Text>
  <TouchableOpacity
    style={styles.dateButton}
    onPress={() => showPicker('time', 'fin')}
  >
    <Text style={styles.dateButtonText}>
      {dateFin.toLocaleTimeString().slice(0, 5)}
    </Text>
  </TouchableOpacity>
</View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {activity.jours > 0 ? "Nombre de mois d'abonnement" : "Nombre de séances"}
        </Text>
        <TextInput
          style={styles.input}
          value={nombreSeances}
          onChangeText={setNombreSeances}
          keyboardType="numeric"
          placeholder="1"
        />
      </View>

      {/* Date et heure de fin (calculées automatiquement) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fin prévue:</Text>
        <Text style={styles.calculatedTime}>
          {dateFin.toLocaleDateString()} à {dateFin.toLocaleTimeString().slice(0, 5)}
        </Text>
      </View>

      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={currentPicker === 'debut' ? dateDebut : dateFin}
          mode={pickerMode}
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}
      {/* //v2.0 */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {activity.jours > 0 && !activity.heure && !activity.minute
            ? "Nombre de mois d'abonnement"
            : "Nombre de créneaux"}
        </Text>
        <TextInput
          style={styles.input}
          value={nbPersonnes}
          onChangeText={setNbPersonnes}
          keyboardType="numeric"
          placeholder="1"
        />
      </View>

      {/* //v1.0 */}
      {/* <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre de personnes</Text>
        <TextInput
          style={styles.input}
          value={nbPersonnes}
          onChangeText={setNbPersonnes}
          keyboardType="numeric"
          placeholder="Nombre de personnes"
        />
      </View> */}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Numéro de téléphone <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={numTel}
          onChangeText={setNumTel}
          keyboardType="phone-pad"
          placeholder="+216 XX XXX XXX"
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
          placeholder="Ajoutez une note ou des détails supplémentaires"
        />
      </View>

      <View style={styles.montantContainer}>
        <Text style={styles.montantLabel}>Montant total</Text>
        <Text style={styles.montantValue}>{montantTotal.toFixed(2)} TND</Text>

        {activity.offreP && (
          <>
            <Text style={styles.montantDetail}>
              Prix original: {parseFloat(activity.prixP).toFixed(2)} TND
            </Text>
            <Text style={styles.montantDetail}>
              Réduction ({activity.offreP}%):
              {((parseFloat(activity.prixP) * parseFloat(activity.offreP)) / 100).toFixed(2)} TND
            </Text>
          </>
        )}

        <Text style={styles.montantDetail}>
          Prix par séance: {(montantTotal / parseInt(nombreSeances || '1')).toFixed(2)} TND
        </Text>
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Confirmer la réservation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  required: {
    color: 'red',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4A7C87',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  calculatedTime: {
    fontSize: 16,
    color: '#4A7C87',
    fontWeight: '500',
  },
  montantContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  montantLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  montantValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A7C87',
    marginBottom: 8,
  },
  montantDetail: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  }
});

const calculerDureeEnHeures = (debut: Date, fin: Date): number => {
  const diffMilliseconds = fin.getTime() - debut.getTime();
  const diffHours = diffMilliseconds / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
};

export default ReservationForm;
