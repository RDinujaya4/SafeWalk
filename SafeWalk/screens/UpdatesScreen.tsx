import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Modal, TextInput, FlatList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { RootStackParamList } from '../App';

dayjs.extend(relativeTime);

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UpdatesRouteProp = RouteProp<RootStackParamList, 'Updates'>;

interface Post {
  id: string;
  userId: string;
  username: string;
  photoURL?: string;
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  anonymous: 'yes' | 'no';
  likes?: string[];
  saves?: string[];
}

const DEFAULT_AVATAR = require('../assets/default-avatar.png');

const UpdatesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UpdatesRouteProp>();
  const highlightedPostId = route.params?.postId ?? null;

  const scrollViewRef = useRef<ScrollView>(null);
  const postRefs = useRef<Record<string, number>>({});


  const currentUid = auth().currentUser?.uid;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const commentsUnsubscribeRef = useRef<() => void | null>(null);

  // Load posts
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as Post[];
        setPosts(list);
        setLoadingPosts(false);
      });

      setTimeout(() => {
  if (highlightedPostId && postRefs.current[highlightedPostId]) {
    scrollViewRef.current?.scrollTo({
      y: postRefs.current[highlightedPostId] - 10,
      animated: true,
    });
  }
}, 500); // Delay to allow layout to render


    return () => unsubscribe();
  }, []);

  const toggleLike = async (post: Post) => {
    const uid = currentUid || '';
    const newLikes = post.likes?.includes(uid)
      ? firestore.FieldValue.arrayRemove(uid)
      : firestore.FieldValue.arrayUnion(uid);
    await firestore().collection('posts').doc(post.id).update({ likes: newLikes });
  };

  const toggleSave = async (post: Post) => {
    const uid = currentUid || '';
    const newSaves = post.saves?.includes(uid)
      ? firestore.FieldValue.arrayRemove(uid)
      : firestore.FieldValue.arrayUnion(uid);
    await firestore().collection('posts').doc(post.id).update({ saves: newSaves });
  };

  const openComments = (postId: string) => {
    if (commentsUnsubscribeRef.current) commentsUnsubscribeRef.current();

    setComments([]);
    setCommentsLoading(true);
    setActivePostId(postId);

    const unsubscribe = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt')
      .onSnapshot(snapshot => {
        const cmts = snapshot.docs.map(d => d.data().text as string);
        setComments(cmts);
        setCommentsLoading(false);
      });

    commentsUnsubscribeRef.current = unsubscribe;
  };

  const closeComments = () => {
    setActivePostId(null);
    if (commentsUnsubscribeRef.current) {
      commentsUnsubscribeRef.current();
      commentsUnsubscribeRef.current = null;
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !activePostId) return;
    await firestore()
      .collection('posts')
      .doc(activePostId)
      .collection('comments')
      .add({
        text: commentText.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: currentUid,
      });
    setCommentText('');
  };

  useEffect(() => {
    return () => {
      if (commentsUnsubscribeRef.current) commentsUnsubscribeRef.current();
    };
  }, []);

  if (loadingPosts) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF7F6C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Updates</Text>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
        {posts.map((post) => {
          const isAnon = post.anonymous === 'yes';
          const liked = post.likes?.includes(currentUid!) ?? false;
          const saved = post.saves?.includes(currentUid!) ?? false;
          const avatarSource = isAnon
            ? DEFAULT_AVATAR
            : post.photoURL
              ? { uri: post.photoURL }
              : DEFAULT_AVATAR;

          const isHighlighted = highlightedPostId === post.id;

          return (
            <View
              key={post.id}
              style={[
                styles.card,
                highlightedPostId === post.id && styles.highlightedCard, // highlight style
              ]}
              onLayout={(event) => {
                postRefs.current[post.id] = event.nativeEvent.layout.y;
              }}
            >
              <View style={styles.userRow}>
                <Image source={avatarSource} style={styles.avatar} />
                <View>
                  <Text style={styles.username}>
                    {isAnon ? 'Anonymous' : `@${post.username}`}
                  </Text>
                  <Text style={styles.time}>
                    {post.createdAt?.toDate
                      ? dayjs(post.createdAt.toDate()).fromNow()
                      : 'Just now'}
                  </Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postLocation}>{post.location}</Text>
              <Text style={styles.postDesc}>{post.description}</Text>
              <Image source={{ uri: post.imageUrl }} style={styles.postImg} />

              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => openComments(post.id)}>
                  <Icon name="chatbubble-outline" size={22} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLike(post)}>
                  <Icon
                    name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={22}
                    color={liked ? '#248dad' : undefined}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleSave(post)}>
                  <Icon
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={22}
                    color={saved ? '#248dad' : undefined}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { }}>
                  <Icon name="share-social-outline" size={22} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Comments Modal */}
      <Modal visible={!!activePostId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {commentsLoading ? (
              <ActivityIndicator size="large" color="#FF7F6C" />
            ) : (
              <FlatList
                data={comments}
                renderItem={({ item }) => <Text style={styles.commentItem}>• {item}</Text>}
                keyExtractor={(_, idx) => idx.toString()}
              />
            )}
            <View style={styles.commentInputRow}>
              <TextInput
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={addComment}>
                <Icon name="send" size={24} color="#4ca0af" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={closeComments} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={26} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
          <Icon name="add-circle-outline" size={26} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Updates', {})}>
          <Icon name="document-text-outline" size={26} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Icon name="map-outline" size={30} />
          <Icon name="location-outline" size={14} style={styles.pin} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpdatesScreen;


const styles = StyleSheet.create({
  // same as previously provided styling, including container, card, icons, modal styles, etc.
  container: { 
    flex:1, 
    backgroundColor:'#eaf4f7', 
    paddingTop:50 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 90,
    marginBottom: 20,
  },
  highlightedCard: {
  borderWidth: 2,
  borderColor: '#248dad',
},
  backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  scrollContainer: { 
    paddingHorizontal:16, 
    paddingBottom:100 
  },
  card: { 
    backgroundColor:'#fff', 
    borderRadius:12, 
    padding:12, 
    marginBottom:16 
  },
  userRow:{ 
    flexDirection:'row', 
    alignItems:'center', 
    marginBottom:6 
  },
  avatar:{ 
    width:35,
    height:35,
    borderRadius:20,
    marginRight:10 
  },
  username:{ 
    fontWeight:'bold' 
  },
  time:{ 
    fontSize:12, 
    color:'#666' 
  },
  postTitle:{ 
    fontSize:16, 
    fontWeight:'600', 
    marginBottom:4, 
    color:'#333' 
  },
  postLocation:{ 
    fontSize:13, 
    color:'#666', 
    marginBottom:4 
  },
  postDesc:{ 
    fontSize:14, 
    color:'#333', 
    marginBottom:8 
  },
  postImg:{ 
    width:'100%', 
    height:150, 
    borderRadius:12, 
    marginBottom:10 
  },
  iconRow:{ 
    flexDirection:'row', 
    justifyContent:'space-between', 
    paddingHorizontal:10 
  },
  bottomNav:{ 
    flexDirection:'row', 
    justifyContent:'space-around', 
    paddingVertical:10, borderTopWidth:1, 
    borderTopColor:'#ddd', 
    backgroundColor:'#fff', 
    position:'absolute', 
    bottom:0,
    left:0,
    right:0 
  },
  pin:{ 
    position:'absolute', 
    top:5, 
    right:7 
  },
  modalOverlay:{ 
    flex:1, 
    justifyContent:'flex-end', 
    backgroundColor:'rgba(0,0,0,0.5)' 
  },
  modalContainer:{ 
    backgroundColor:'#f9f9f9', 
    padding:16, 
    borderTopLeftRadius:20, 
    borderTopRightRadius:20, 
    maxHeight:'70%' 
  },
  commentInputRow:{ 
    flexDirection:'row', 
    alignItems:'center', 
    marginTop:12 
  },
  commentInput:{ 
    flex:1, 
    borderWidth:1,
    borderColor:'#ccc', 
    borderRadius:20, 
    paddingHorizontal:12, 
    marginRight:10, 
    height:40, 
    backgroundColor:'#fff' 
  },
  commentItem:{ 
    paddingVertical:4, 
    borderBottomWidth:0.5, 
    borderBottomColor:'#ccc' 
  },
  closeBtn:{ 
    alignSelf:'center', 
    marginTop:10 
  },
  closeText:{ 
    color:'red', 
    fontWeight:'600' 
  },
  centered:{ 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center' 
  },
  loadingContainer:{ 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center' 
  },
});

