import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UpdatesScreen: React.FC = () => {
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
        <Text style={styles.title}>Updates</Text>
      </View>

      {/* Scrollable Updates */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {[1, 2].map((item, index) => (
          <View key={index} style={styles.updateCard}>
            <View style={styles.userInfo}>
              <Image
                source={require('../assets/profile-img.jpg')} // Replace with user profile if available
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>@jekob</Text>
                <Text style={styles.time}>1h ago</Text>
              </View>
            </View>

            <Text style={styles.postText}>
              Increase of car theft in Colombo 7, make sure to lock your vehicles.
            </Text>

            <Image
              source={require('../assets/news.jpg')} // Add your asset here
              style={styles.postImage}
            />

            <View style={styles.iconRow}>
              <Icon name="chatbubble-outline" size={22} style={styles.icon} />
              <Icon name="thumbs-up-outline" size={22} style={styles.icon} />
              <Icon name="bookmark-outline" size={22} style={styles.icon} />
              <Icon name="share-social-outline" size={22} style={styles.icon} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

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
    marginLeft: 90,
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
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  icon: {
    color: '#000',
  },
});

export default UpdatesScreen;
