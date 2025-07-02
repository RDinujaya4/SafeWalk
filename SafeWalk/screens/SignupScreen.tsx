import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
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
  const [passwordError, setPasswordError] = useState('');

  // Real-time username check
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      checkUsername(username);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username]);

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

  const isPasswordStrong = (pass: string) => {
    const strongRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
    return strongRegex.test(pass);
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

    if (!isPasswordStrong(password)) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        username,
        email,
        role: 'user',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore().collection('usernames').doc(username).set({
        uid: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

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

      {/* Logo Section */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.logoText}>SafeWalk</Text>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <View style={styles.cardHandle} />
        <Text style={styles.title}>Signup</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setIsUsernameTaken(false);
          }}
          style={styles.input}
        />
        {isUsernameTaken && (
          <Text style={styles.warning}>Username already taken</Text>
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
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(
              isPasswordStrong(text)
                ? ''
                : 'Use 8+ characters, 1 uppercase, 1 number, 1 symbol'
            );
          }}
          style={styles.input}
        />
        {passwordError !== '' && (
          <Text style={styles.warning}>{passwordError}</Text>
        )}

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign UP</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.loginWithText}>Login With</Text>
          <View style={styles.divider} />
        </View>
        <Image source={require('../assets/google.png')} style={styles.googleIcon} />

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
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
    backgroundColor: '#E8F9FF',
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E5077',
    marginLeft: 10,
  },
  card: {
    marginTop: 30,
    backgroundColor: '#2E5077',
    width: '100%',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cardHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF6B61',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 14,
    borderRadius: 30,
    marginBottom: 12,
    fontSize: 16,
  },
  warning: {
    color: '#FF6B61',
    marginBottom: 10,
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 145,
    marginTop: 10,
    marginBottom: 15,
  },
  signupButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginBottom: 10,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  linkText: {
    color: '#000',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#fff',
  },
  loginWithText: {
    marginHorizontal: 10,
    color: '#fff',
    fontWeight: '500',
  },
});
