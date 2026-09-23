import React, { useContext } from 'react';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import CafeRestoReservationForm from './CafeRestoReservationForm';
import { Alert } from 'react-native';
import { AuthContext } from '../../AuthContext';

type RootStackParamList = {
  CafeRestoReservation: { activityId: number; userId: string };
  choisiType: undefined;
};

type CafeRestoReservationRouteProp = RouteProp<RootStackParamList, 'CafeRestoReservation'>;

const CafeRestoReservationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CafeRestoReservationRouteProp>();
  const { activityId } = route.params;
  const { token } = useContext(AuthContext);

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
    <CafeRestoReservationForm 
      activityId={activityId} 
      userId={token} 
      onSuccess={handleReservationSuccess} 
    />
  );
};

export default CafeRestoReservationScreen;