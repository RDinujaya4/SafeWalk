import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

type EditPostRouteProp = RouteProp<RootStackParamList, 'EditPost'>;

const EditPostScreen: React.FC = () => {
  const route = useRoute<EditPostRouteProp>();
  const navigation = useNavigation();
  const { postId } = route.params;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      const doc = await firestore().collection('posts').doc(postId).get();
      const data = doc.data();
      if (data) {
        setTitle(data.title);
        setLocation(data.location);
        setDescription(data.description);
        setImageUri(data.imageUrl);
        setOriginalImageUrl(data.imageUrl);
      }
    };
    loadPost();
  }, [postId]);

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const updatePost = async () => {
    if (!title || !description || !location) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    let imageUrl = originalImageUrl;

    try {
      if (imageUri && imageUri !== originalImageUrl) {
        const fileName = `${user.uid}_${postId}_${Date.now()}.jpg`;
        const localPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
        await RNFS.copyFile(imageUri, localPath);

        const ref = storage().ref(`posts/${fileName}`);
        await ref.putFile(localPath);
        imageUrl = await ref.getDownloadURL();

        // 🔥 Delete old image from Firebase Storage
        if (originalImageUrl && originalImageUrl !== imageUrl) {
          const oldRef = storage().refFromURL(originalImageUrl);
          await oldRef.delete().catch(err =>
            console.warn('Failed to delete old image:', err.message)
          );
        }
      }

      await firestore().collection('posts').doc(postId).update({
        title,
        description,
        location,
        imageUrl,
      });

      Alert.alert('Success', 'Post updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Something went wrong during update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Post</Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Location</Text>
        <TextInput value={location} onChangeText={setLocation} style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <Text style={styles.label}>Image</Text>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        <TouchableOpacity onPress={pickImage} style={styles.pickButton}>
          <Text style={{ color: '#4ca0af' }}>Pick New Image</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={updatePost} style={styles.saveButton} disabled={loading}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FF7F6C" />
          <Text style={{ color: '#FF7F6C', marginTop: 10 }}>Updating Post...</Text>
        </View>
      )}
    </View>
  );
};

export default EditPostScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#eaf4f7',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 90,
    marginTop: 25,
  },
  backButton: {
    marginLeft: -15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 25,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  image: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  pickButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4ca0af',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
