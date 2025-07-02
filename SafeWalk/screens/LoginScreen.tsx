import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Spinner from 'react-native-loading-spinner-overlay';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const userDoc = await firestore().collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        Alert.alert('Error', 'User record not found in Firestore.');
        return;
      }

      const userData = userDoc.data();

      if (userData?.role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      } else if (userData?.role === 'user') {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        Alert.alert('Error', 'User role is invalid or missing.');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Spinner visible={loading} textContent="Logging in..." textStyle={{ color: '#fff' }} />

      {/* Top Section */}
      <View style={styles.topSection}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.logoText}>SafeWalk</Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.card}>
        <View style={styles.handleBar} />

        <Text style={styles.loginTitle}>Login</Text>
        <Text style={styles.subText}>Welcome Back</Text>

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

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.loginWithText}>Login With</Text>
          <View style={styles.divider} />
        </View>

        <Image
          source={require('../assets/google.png')}
          style={styles.googleIcon}
        />

        <Text style={styles.footerText}>
          Don’t have an account?{' '}
          <Text style={styles.clickHere} onPress={() => navigation.navigate('Signup')}>
            click here
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F9FF',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 50,
    flexDirection: 'row',
    marginLeft: 30
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
    flex: 1,
    backgroundColor: '#2E5077',
    marginTop: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  handleBar: {
    width: 60,
    height: 5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B61',
    textAlign: 'center',
  },
  subText: {
    textAlign: 'center',
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 15,
  },
  forgotText: {
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: 25,
    fontWeight: '500',
    marginLeft: 5
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
  googleIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
  },
  clickHere: {
    color: '#000',
    fontWeight: 'bold',
  },
});
