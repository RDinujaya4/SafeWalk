import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SafetyMapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Safety Map</Text>
        {/* Placeholder for alignment */}
        <View style={{ width: 26 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {/* Map label */}
      <Text style={styles.mapLabel}>Mark the area</Text>

      {/* Map image */}
      <Image
        source={require('../assets/map.png')}
        style={styles.mapImage}
        resizeMode="cover"
      />

      {/* Description Input */}
      <TextInput
        style={styles.descriptionBox}
        placeholder="Description"
        placeholderTextColor="#999"
        multiline
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.addButton]}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SafetyMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f1f4',
    paddingTop: 40,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: '#000',
  },
  mapLabel: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 5,
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#000',
    height: 140,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    width: 130,
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#e5f4ec',
  },
  addButtonText: {
    color: '#009b4d',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fbe9e9',
  },
  cancelButtonText: {
    color: '#d62828',
    fontWeight: 'bold',
  },
});
