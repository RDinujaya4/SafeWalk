import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  toUserId: string;
  fromUserId: string;
  fromUsername: string;
  type: 'new_post';
  postTitle: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  read: boolean;
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentUid = auth().currentUser?.uid;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('toUserId', '==', currentUid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot || snapshot.empty) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Notification, 'id'>),
        }));
        setNotifications(list);
        setLoading(false);
      }, error => {
        console.error('Error loading notifications:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [currentUid]);

  const handleClear = async () => {
    const batch = firestore().batch();
    notifications.forEach(notif => {
      const ref = firestore().collection('notifications').doc(notif.id);
      batch.delete(ref);
    });
    await batch.commit();
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B5C" style={{ marginTop: 100 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {notifications.map((item) => (
            <View key={item.id} style={styles.notificationBox}>
              <Text style={styles.message}>
                {item.fromUsername === 'Anonymous'
                  ? 'An anonymous user'
                  : `@${item.fromUsername}`}{' '}
                added a new post: {item.postTitle}
              </Text>
              <View style={styles.timeRow}>
                <Text style={styles.time}>{dayjs(item.createdAt.toDate()).fromNow()}</Text>
                {!item.read && <View style={styles.redDot} />}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F1',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
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
    marginLeft: 65,
    color: '#000',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  notificationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    elevation: 1,
  },
  message: {
    fontSize: 15,
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginRight: 5,
  },
  redDot: {
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
  },
  clearButton: {
    backgroundColor: '#FF6B5C',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 15,
    elevation: 2,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
