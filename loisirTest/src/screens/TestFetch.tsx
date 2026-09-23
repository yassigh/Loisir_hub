import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const TestFetch = () => {
  useEffect(() => {
    fetch('http://192.168.100.122:8000/api/activites-payantes')
      .then(res => res.json())
      .then(data => console.log('Test fetch direct:', data))
      .catch(err => console.error('Erreur fetch direct:', err));
  }, []);

  return (
    <View>
      <Text>Test Fetch</Text>
    </View>
  );
};

export default TestFetch;