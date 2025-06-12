import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Spinner from 'react-native-loading-spinner-overlay';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const checkUsername = async (name: string) => {
    if (!name.trim()) return;
    try {
      const doc = await firestore().collection('usernames').doc(name).get();
      setIsUsernameTaken(doc.exists);
    } catch (error) {
      console.log('Error checking username:', error);
      setIsUsernameTaken(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (isUsernameTaken) {
      Alert.alert('Error', 'Username is already taken.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth account
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // 2. Save user data to 'users'
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        username,
        email,
        role: 'user',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 3. Reserve username
      await firestore().collection('usernames').doc(username).set({
        uid: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 4. Redirect based on role
      const docSnap = await firestore().collection('users').doc(user.uid).get();
      const userData = docSnap.data();

      if (userData?.role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }

    } catch (error: any) {
      console.log('Signup Error:', error);
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Spinner visible={loading} textContent="Signing up..." textStyle={{ color: '#fff' }} />

      <Text style={styles.title}>Signup</Text>

      <FastImage
        source={require('../assets/signup.gif')}
        style={styles.image}
        resizeMode={FastImage.resizeMode.contain}
      />

      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setIsUsernameTaken(false); // reset when typing
        }}
        onBlur={() => checkUsername(username)}
        style={styles.input}
      />
      {isUsernameTaken && (
        <Text style={{ color: 'red', marginBottom: 10 }}>Username already taken</Text>
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
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
          <Text style={styles.linkText} onPress={() => navigation.navigate('AdminLogin')}>
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
