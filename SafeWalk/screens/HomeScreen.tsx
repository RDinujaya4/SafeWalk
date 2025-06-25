import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Post {
  id: string;
  username: string;
  imageUrl: string;
  title: string;
  userId: string;
  anonymous: 'yes' | 'no';
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profilePic, setProfilePic] = useState('');
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    // 1. Get user profile photo
    const unsubscribeUser = firestore()
    .collection('users')
    .doc(user.uid)
    .onSnapshot((snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.photoURL) {
          setProfilePic(data.photoURL);
        }
      }
    });
    // 2. Fetch latest posts (exclude anonymous & own)
    const unsubscribePosts = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .onSnapshot(snapshot => {
        const posts = snapshot.docs
          .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
          .filter(p => p.anonymous === 'no' && p.userId !== user.uid) as Post[];
        setRecentPosts(posts);
      });

    // 3. Count unread notifications
    const unsubscribeNotifications = firestore()
      .collection('notifications')
      .where('toUserId', '==', user.uid)
      .where('read', '==', false)
      .onSnapshot(snapshot => {
        setUnreadCount(snapshot.size);
      });

    return () => {
      unsubscribeUser();
      unsubscribePosts();
      unsubscribeNotifications();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.TopTitle}>SafeWalk</Text>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={profilePic ? { uri: profilePic } : require('../assets/default-avatar.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.notificationBox}>
            <Icon name="notifications-outline" size={27} color="#000" />
            {unreadCount > 0 && (
              <View style={styles.notificationDot}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
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
        <TouchableOpacity onPress={() => navigation.navigate('Updates', {})}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {recentPosts.length === 0 ? (
          <ActivityIndicator color="#999" style={{ marginTop: 10 }} />
        ) : (
          recentPosts.map(post => (
            <TouchableOpacity
              key={post.id}
              onPress={() => navigation.navigate('Updates', { postId: post.id })}
            >
              <Image source={{ uri: post.imageUrl }} style={styles.updateImage} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Safety Map */}
      <Text style={styles.sectionTitle}>Safety Map</Text>
      <Image source={require('../assets/map.png')} style={styles.mapImage} />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={26} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
          <Icon name="add-circle-outline" size={26} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Updates', {})}>
          <Icon name="document-text-outline" size={26} color="#000" />
        </TouchableOpacity>
        <View style={styles.mapWithPin}>
          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <Icon name="map-outline" size={30} color="#000" />
            <Icon name="location-outline" size={14} color="#000" style={styles.pinOnMap} />
          </TouchableOpacity>
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
    paddingTop: 20,
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
    borderRadius: 13,
  },
  notificationDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateCard: {
    width: 180,
    marginRight: 15,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 6,
  },
  postBy: {
    fontSize: 12,
    color: '#666',
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
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  searchIcon: {
    marginRight: 5,
    marginLeft: 8,
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
  TopTitle: {
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
