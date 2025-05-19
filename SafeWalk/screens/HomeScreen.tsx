import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// Define navigation prop type for navigating from Home to any screen
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('../assets/profile.png')} // Replace with your profile image path
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.notificationBox}>
            <Icon name="notifications-outline" size={27} color="#000" />
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput placeholder="Search..." style={styles.searchInput} placeholderTextColor="#999" />
      </View>

      {/* Recent Updates */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        <Image source={require('../assets/update1.png')} style={styles.updateImage} />
        <Image source={require('../assets/update2.png')} style={styles.updateImage} />
      </ScrollView>

      {/* Safety Map */}
      <Text style={styles.sectionTitle}>Safety Map</Text>
      <Image source={require('../assets/map.png')} style={styles.mapImage} />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Icon name="home-outline" size={26} color="#000" />

        {/* Updated: Touchable icon to navigate to AddPost screen */}
        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
          <Icon name="add-circle-outline" size={26} color="#000" />
        </TouchableOpacity>

        <Icon name="document-text-outline" size={26} color="#000" />
        <View style={styles.mapWithPin}>
          <Icon name="map-outline" size={30} color="#000" />
          <Icon name="location-outline" size={14} color="#000" style={styles.pinOnMap} />
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F6F9',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  notificationBox: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 16,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  viewAll: {
    color: '#888',
    fontSize: 14,
  },
  scrollRow: {
    marginBottom: 20,
  },
  updateImage: {
    width: 350,
    height: 180,
    borderRadius: 10,
    marginRight: 15,
  },
  mapImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 100,
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
