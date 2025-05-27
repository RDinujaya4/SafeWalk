import React, { useState } from 'react';
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust if your navigation file is elsewhere

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminLogin'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>

      <FastImage
        source={require('../assets/login.gif')}
        style={styles.image}
        resizeMode={FastImage.resizeMode.contain}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('AdminDashboard')}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CDF2D3',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    color: '#FF6B61',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 14,
    borderRadius: 30,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#0DA574',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
