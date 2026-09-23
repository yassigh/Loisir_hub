import React, { useContext } from 'react';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import HotelReservationForm from './HotelReservationForm';
import { Alert } from 'react-native';
import { AuthContext } from '../../AuthContext';

type RootStackParamList = {
  HotelReservation: { activityId: number; userId: string };
  choisiType: undefined;
};

type HotelReservationRouteProp = RouteProp<RootStackParamList, 'HotelReservation'>;

const HotelReservationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<HotelReservationRouteProp>();
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
    <HotelReservationForm 
      activityId={activityId} 
      userId={token} 
      onSuccess={handleReservationSuccess} 
    />
  );
};

export default HotelReservationScreen;