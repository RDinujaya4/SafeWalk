import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UpdatesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

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
                source={require('../assets/profile-img.jpg')}
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
              source={require('../assets/news.jpg')}
              style={styles.postImage}
            />

            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Icon name="chatbubble-outline" size={22} style={styles.icon} />
              </TouchableOpacity>
              <Icon name="thumbs-up-outline" size={22} style={styles.icon} />
              <Icon name="bookmark-outline" size={22} style={styles.icon} />
              <Icon name="share-social-outline" size={22} style={styles.icon} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Comments Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Comments</Text>

            <FlatList
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.commentItem}>• {item}</Text>}
            />

            <View style={styles.commentInputRow}>
              <TextInput
                placeholder="Add a comment..."
                value={comment}
                onChangeText={setComment}
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={handleAddComment}>
                <Icon name="send" size={24} color="#4ca0af" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
          <Icon name="add-circle-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Updates')}>
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
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  commentItem: {
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 40,
    backgroundColor: '#fff',
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    color: 'red',
    fontWeight: '600',
  },
});

export default UpdatesScreen;
