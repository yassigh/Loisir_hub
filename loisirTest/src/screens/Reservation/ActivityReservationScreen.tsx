import React, { useContext } from 'react';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import ActivityReservationForm from './ActivityReservationForm';
import { Alert } from 'react-native';
import { AuthContext } from '../../AuthContext';

type RootStackParamList = {
  ActivityReservation: { activityId: number; userId: string };
  choisiType: undefined;
};

type ActivityReservationRouteProp = RouteProp<RootStackParamList, 'ActivityReservation'>;

const ActivityReservationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ActivityReservationRouteProp>();
  const { activityId } = route.params;
  const { token } = useContext(AuthContext);

  // Rediriger vers choisiType si pas de token
  React.useEffect(() => {
    if (!token) {
      navigation.navigate('choisiType' as never);
      return;
    }
  }, [token, navigation]);

  const handleReservationSuccess = () => {
    Alert.alert('Succès', 'Réservation réussie');
  };

  if (!token) return null;

  return (
    <ActivityReservationForm 
      activityId={activityId} 
      userId={token} 
      onSuccess={handleReservationSuccess} 
    />
  );
};

export default ActivityReservationScreen;