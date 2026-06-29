import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useAuthStore } from '../../store/auth.store';

const LoginScreen = ({ navigation }: any) => {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={isLoading ? 'Loading...' : 'Login'} onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;