import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'You just entered danger area, Be aware of thieves', time: '13.22', isNew: true },
    { id: 2, message: 'You just entered danger area, Be aware of thieves', time: '13.22', isNew: true },
    { id: 3, message: 'You just entered danger area, Be aware of thieves', time: '13.22', isNew: false },
    { id: 4, message: 'You just entered danger area, Be aware of thieves', time: '13.22', isNew: false },
  ]);

  const handleClear = () => {
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {/* Notification List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.notificationBox}>
            <Text style={styles.message}>{item.message}</Text>
            <View style={styles.timeRow}>
              <Text style={styles.time}>{item.time}</Text>
              {item.isNew && <View style={styles.redDot} />}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Clear Button */}
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
