import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UpdateMapScreen: React.FC = () => {
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
        <Text style={styles.title}>Update Map</Text>
      </View>

      {/* Scrollable Map Updates */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {[1, 2].map((item, index) => (
          <View key={index} style={styles.updateCard}>
            <View style={styles.userInfo}>
              <Image
                source={require('../assets/profile-img.jpg')}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>@jekob</Text>
                <Text style={styles.time}>1h ago</Text>
              </View>
            </View>

            <Text style={styles.postText}>
              Increase of car theft in Colombo 7, make sure to lock your
              vehicles.
            </Text>

            <Image
              source={require('../assets/news.jpg')}
              style={styles.mapImage}
            />

            <TouchableOpacity style={styles.removeButton}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* View More */}
        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>View more</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default UpdateMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf4f7',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 80,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  postText: {
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  mapImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 1, height: 1},
    shadowRadius: 3,
    elevation: 3,
  },
  removeText: {
    color: '#d00',
    fontWeight: 'bold',
  },
  viewMoreButton: {
    alignSelf: 'center',
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  viewMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
