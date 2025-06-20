import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
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

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [totalPosts, setTotalPosts] = useState(0);

  const logoutHandler = async () => {
    try {
      await auth().signOut();
      Alert.alert('Logged Out', 'You have been logged out.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribeUser = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc.exists()) {
          const data = doc.data();
          setUsername(data?.username || '');
          setName(data?.name || '');
          setBio(data?.bio || '');
          setPhotoURL(data?.photoURL || '');
        }
      });

    const unsubscribePosts = firestore()
      .collection('posts')
      .where('userId', '==', user.uid)
      .onSnapshot(snapshot => {
        setTotalPosts(snapshot.size);
      });

    return () => {
      unsubscribeUser();
      unsubscribePosts();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          <Image
            source={photoURL ? { uri: photoURL } : require('../assets/profile-img.jpg')}
            style={styles.profileImage}
          />
        </View>

        <Text style={styles.username}>@{username}</Text>

        {/* Display Name */}
        <View style={styles.inputWrapper}>
          <Icon name="person-outline" size={18} style={styles.icon} />
          <TextInput value={name} style={styles.input} editable={false} />
        </View>

        {/* Bio */}
        <View style={styles.inputWrapper}>
          <Icon name="information-circle-outline" size={19} style={styles.icon} />
          <TextInput value={bio} style={styles.input} multiline editable={false} />
        </View>

        {/* Total Posts */}
        <View style={styles.postsCountBox}>
          <Icon name="document-text-outline" size={18} style={styles.icon} />
          <Text style={styles.postsText}>Posts: {totalPosts}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('AddPost')}
          >
            <Text style={styles.secondaryButtonText}>Manage Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('AddPost')}
          >
            <Text style={styles.secondaryButtonText}>Saved Posts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logoutHandler}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7f1f3',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 10,
  },
  backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  profileContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  username: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '600',
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
  postsCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    marginBottom: 6,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postsText: {
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#248dad',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutBtn: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: '#FF6B5E',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
