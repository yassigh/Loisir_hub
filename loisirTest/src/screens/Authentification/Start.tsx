import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {

  choisiType: undefined;
  Acceuil: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const OnboardingPage = () => {
  const navigation = useNavigation<NavigationProps>();
  
  // Animation pour les cercles
  const [moveCircle1] = useState(new Animated.Value(0));
  const [moveCircle2] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animer les cercles
    Animated.loop(
      Animated.sequence([ 
        Animated.timing(moveCircle1, {
          toValue: 50,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(moveCircle1, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.loop(
      Animated.sequence([ 
        Animated.timing(moveCircle2, {
          toValue: -50,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(moveCircle2, {
          toValue: 30,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [moveCircle1, moveCircle2]);

  return (
    <View style={styles.container}>
      {/* Cercles animés */}
      <Animated.View style={[styles.movingCircleTop, { transform: [{ translateY: moveCircle1 }] }]}>
        <View style={styles.circle}></View>
      </Animated.View>

      <Animated.View style={[styles.movingCircleBottom, { transform: [{ translateY: moveCircle2 }] }]}>
        <View style={styles.circle}></View>
      </Animated.View>

      <Image source={require('../assets/logo.png')} style={styles.logo} />

  

      <Text style={styles.welcomeText}>Beautiful country in application</Text>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Acceuil')}
        >
          <Text style={styles.startButtonText}>Let's get started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.accountSection} onPress={() => navigation.navigate('choisiType')}>
          <Text style={styles.accountText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 65,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#8EB6AD',
    elevation: 5,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'cover',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4A7C87',
    marginTop: 20,
    marginBottom: 30,
  },
  actionSection: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#D7A738',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  accountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  accountText: {
    fontSize: 15,
    color: '#4A7C87',
    fontWeight: '500',
  },
  movingCircleTop: {
    position: 'absolute',
    top: -100, 
    width: 150, 
    height: 150,
    backgroundColor: '#8EB6AD',
    borderRadius: 75, 
    elevation: 5,
    justifyContent: 'center',
    left: -10, 
  },
  movingCircleBottom: {
    position: 'absolute',
    bottom: -80, 
    width: 150, 
    height: 150, 
    backgroundColor: '#8EB6AD',
    borderRadius: 75, 
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    right: -15, 
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 75, // Pour faire un cercle parfait
    backgroundColor: '#D7A738',
  },
});

export default OnboardingPage;
