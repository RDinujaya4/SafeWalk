import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Icon name="settings-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/profile-img.jpg')} // Replace with actual image
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraIcon}>
          <Icon name="camera-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.username}>@rayan_ds</Text>

      {/* Form Fields */}
      <View style={styles.inputWrapper}>
        <Icon name="person-outline" size={18} style={styles.icon} />
        <TextInput
          value="Rayan Dinujaya"
          style={styles.input}
          editable={false}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="mail-outline" size={18} style={styles.icon} />
        <TextInput
          value="rayan@gamil.com"
          style={styles.input}
          editable={false}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="information-circle-outline" size={18} style={styles.icon} />
        <TextInput
          value="Student at SCU & UOB, Software developer"
          style={styles.input}
          multiline
          editable={false}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7f1f3',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#555',
    borderRadius: 12,
    padding: 4,
  },
  username: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
  },
  icon: {
    marginRight: 10,
    color: '#444',
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 15,
  },
   backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  logoutBtn: {
    backgroundColor: '#FF6B5E',
    marginTop: 30,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
