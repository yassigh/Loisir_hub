import React, { useContext } from 'react';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import CulturelleForm from './CulturelleForm';
import { Alert } from 'react-native';
import { AuthContext } from '../../AuthContext';

type RootStackParamList = {
  CafeRestoReservation: { activityId: number; userId: string };
  choisiType: undefined;
  Culturelle: { activityId: number; userId: string };
};

type CulturelleRouteProp = RouteProp<RootStackParamList, 'Culturelle'>;

const CulturelleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CulturelleRouteProp>();
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
    <CulturelleForm 
      activityId={activityId} 
      userId={token} 
      onSuccess={handleReservationSuccess} 
    />
  );
};

export default CulturelleScreen;