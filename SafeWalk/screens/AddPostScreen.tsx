import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddPostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Post</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Upload Image */}
      <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Icon name="upload-cloud" size={30} color="#999" />
            <Text style={styles.uploadText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Location Input */}
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#999"
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
      />

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icons name="home-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
          <Icons name="add-circle-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Updates')}>
          <Icons name="document-text-outline" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.mapWithPin}>
          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
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
    marginBottom: 25,
    fontSize: 16,
    textAlignVertical: 'top',
    elevation: 2,
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
});
