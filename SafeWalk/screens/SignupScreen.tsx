import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust based on your actual navigation

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      <Image
        source={require('../assets/signup-image.png')} // Replace with your signup illustration
        style={styles.image}
        resizeMode="contain"
      />

      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
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

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.signupButton} onPress={() => {}}>
        <Text style={styles.signupButtonText}>Create Account</Text>
      </TouchableOpacity>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
            click here
            </Text>
        </Text>

        <Text style={styles.footerText}>
            Admin Login?{' '}
            <Text
            style={styles.linkText}
            onPress={() => navigation.navigate('AdminLogin')} // Update if your route name is different
            >
            click here
            </Text>
        </Text>
      </View>
    </View>
  );
};

export default SignupScreen;

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
  signupButton: {
    backgroundColor: '#0DA574',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 4,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#000',
    fontSize: 14,
  },
  linkText: {
    color: '#0000FF',
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
  },  
});
