import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Password Reset',
        'An email has been sent to reset your password.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.log('Reset Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Spinner visible={loading} textContent="Sending..." textStyle={{ color: '#fff' }} />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.logoText}>SafeWalk</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHandle} />
        <Text style={styles.title}>Forgot Password</Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetButtonText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Back to{' '}
          <Text style={styles.linkText} onPress={() => navigation.goBack()}>
            Login
          </Text>
        </Text>
        <Icon name="arrow-back-circle-outline" size={40} color="#fff" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F9FF',
    alignItems: 'center',
  },
  header: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
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
    marginTop: 50,
    backgroundColor: '#2E5077',
    width: '100%',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  cardHandle: {
    width: 60,
    height: 5,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 5,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B61',
    marginBottom: 55,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 14,
    borderRadius: 30,
    marginBottom: 20,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 150,
    marginTop: 10,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 30,
  },
  linkText: {
    color: '#fff',
  },
});
