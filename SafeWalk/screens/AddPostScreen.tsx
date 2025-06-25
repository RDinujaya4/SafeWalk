import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddPostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [username, setUsername] = useState('');

  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;
    // Fetch username from users collection
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc.exists()) {
          const data = doc.data();
          if (data?.username) setUsername(data.username);
        }
      });

    return () => unsubscribe();
  }, [user]);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleShare = async () => {
  if (!user) return;

  if (!imageUri || !title.trim() || !location.trim() || !description.trim()) {
    Alert.alert('Missing Fields', 'Please fill in all fields and select an image.');
    return;
  }

  try {
    setUploading(true);

    // Fetch user details from Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const profilePicUrl = userData?.photoURL || '';

    // Upload image to Firebase Storage
    const fileName = `${user.uid}_${Date.now()}.jpg`;
    const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
    await RNFS.copyFile(imageUri, filePath);

    const storageRef = storage().ref(`posts/${fileName}`);
    await storageRef.putFile(filePath);

    const downloadURL = await storageRef.getDownloadURL();

    // Save post to Firestore
    const postRef = await firestore().collection('posts').add({
      userId: user.uid,
      username: username || 'unknown',
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      anonymous: anonymous ? 'yes' : 'no',
      photoURL: profilePicUrl,
      imageUrl: downloadURL,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Send a notification to all users except the sender
    const usersSnapshot = await firestore().collection('users').get();
    const batch = firestore().batch();

    usersSnapshot.forEach(doc => {
      if (doc.id !== user.uid) {
        const notifRef = firestore().collection('notifications').doc();
        batch.set(notifRef, {
          toUserId: doc.id,
          fromUserId: user.uid,
          fromUsername: anonymous ? 'Anonymous' : username,
          type: 'new_post',
          postTitle: title.trim(),
          createdAt: firestore.FieldValue.serverTimestamp(),
          read: false,
        });
      }
    });

    await batch.commit();

      Alert.alert('Success', 'Post shared successfully!');
      setImageUri(null);
      setTitle('');
      setLocation('');
      setDescription('');
      setAnonymous(false);
      navigation.goBack();
  } catch (error) {
      console.error('Post upload failed:', error);
      Alert.alert('Error', 'Failed to share post.');
    } finally {
      setUploading(false);
      }
};


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} scrollEnabled={!uploading}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={uploading}>
            <Icons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.titleText}>Add Post</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Upload Image */}
        <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage} disabled={uploading}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Icon name="upload-cloud" size={30} color="#999" />
              <Text style={styles.uploadText}>Upload Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title Input */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
          editable={!uploading}
        />

        {/* Location Input */}
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#999"
          editable={!uploading}
        />

        {/* Description Input */}
        <TextInput
          style={styles.textArea}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
          editable={!uploading}
        />

        {/* Anonymous Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAnonymous(!anonymous)}
          disabled={uploading}
        >
          <Icons
            name={anonymous ? 'checkbox-outline' : 'square-outline'}
            size={23}
            color="#333"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.checkboxLabel}>Share Anonymously</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={uploading}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Loading Spinner */}
      {uploading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FF7F6C" />
          <Text style={{ color: '#FF7F6C', marginTop: 10 }}>Uploading Post...</Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} disabled={uploading}>
          <Icons name="home-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AddPost')} disabled={uploading}>
          <Icons name="add-circle-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Updates', {})} disabled={uploading}>
          <Icons name="document-text-outline" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.mapWithPin}>
          <TouchableOpacity onPress={() => navigation.navigate('Map')} disabled={uploading}>
            <Icons name="map-outline" size={30} color="#000" />
            <Icons name="location-outline" size={14} color="#000" style={styles.pinOnMap} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF4F6',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  mapWithPin: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  pinOnMap: {
    position: 'absolute',
    top: 5,
    right: 7,
  },
  imageUploadBox: {
    height: 150,
    borderWidth: 1,
    borderColor: '#bbb',
    borderStyle: 'dotted',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 8,
    color: '#777',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    elevation: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#FF7F6C',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  shareButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
