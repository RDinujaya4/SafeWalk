import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc.exists()) {
          const data = doc.data();
          setName(data?.name || '');
          setBio(data?.bio || '');
          setEmail(data?.email || user.email || '');
        }
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    try {
      await firestore().collection('users').doc(user?.uid).update({
        name,
        bio,
      });
      Alert.alert('Saved', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <Text style={{ width: 24 }}>{' '}</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        <Image source={require('../assets/profile-img.jpg')} style={styles.profileImage} />
        <TouchableOpacity style={styles.cameraIcon}>
          <Icon name="camera-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Editable Fields */}
      <View style={styles.inputWrapper}>
        <Icon name="person-outline" size={18} style={styles.icon} />
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Full Name"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="information-circle-outline" size={18} style={styles.icon} />
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={styles.input}
          placeholder="Your bio"
          multiline
        />
      </View>

      <View style={[styles.inputWrapper, { backgroundColor: '#f0f0f0' }]}>
        <Icon name="mail-outline" size={18} style={styles.icon} />
        <TextInput
          value={email}
          editable={false}
          style={[styles.input, { color: '#888' }]}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e7f1f3',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#555',
    borderRadius: 12,
    padding: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
  },
  icon: {
    marginRight: 10,
    color: '#444',
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#248dad',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
