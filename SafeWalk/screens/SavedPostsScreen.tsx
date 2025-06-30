import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  FlatList, TextInput, Modal, ActivityIndicator, Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { RootStackParamList } from '../App';

dayjs.extend(relativeTime);

const DEFAULT_AVATAR = require('../assets/default-avatar.png');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
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
  commentsCount?: number;
}

interface Comment {
  id: string;
  userId: string;
  username?: string;
  photoURL?: string;
  anonymous: 'yes' | 'no';
  text: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

const SavedPostsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const currentUid = auth().currentUser?.uid;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [anonymousComment, setAnonymousComment] = useState(false);
  const commentsUnsubscribeRef = useRef<(() => void) | null>(null);
  const commentListenersRef = useRef<Record<string, () => void>>({});
  // NEW: Separate comment count map to avoid frequent full post updates
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});


  useEffect(() => {
    if (!currentUid) return;

    const unsubscribe = firestore()
      .collection('posts')
      .where('saves', 'array-contains', currentUid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
          likes: doc.data().likes || [],
          saves: doc.data().saves || [],
          commentsCount: 0
        })) as Post[];

        // Reset comment listeners
        Object.values(commentListenersRef.current).forEach(unsub => unsub?.());
        commentListenersRef.current = {};

        list.forEach(post => {
          // NEW: Only update commentCounts separately, not full post list
          const unsubscribeComments = firestore()
            .collection('posts')
            .doc(post.id)
            .collection('comments')
            .onSnapshot(commentSnapshot => {
              setCommentCounts(prev => ({
                ...prev,
                [post.id]: commentSnapshot.size,
              }));
            });

          commentListenersRef.current[post.id] = unsubscribeComments;
        });

        setPosts(list);
        setLoading(false);
      });

    return () => {
      unsubscribe();
      Object.values(commentListenersRef.current).forEach(unsub => unsub?.());
    };
  }, [currentUid]);

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

  const openComments = async (postId: string) => {
    if (commentsUnsubscribeRef.current) commentsUnsubscribeRef.current();
    setComments([]);
    setCommentsLoading(true);
    setActivePostId(postId);
    const unsubscribe = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const cmts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Comment[];
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
    const docUser = await firestore().collection('users').doc(currentUid!).get();
    const dataUser = docUser.data() || {};
    const commentUsername = anonymousComment ? 'Anonymous' : dataUser.username || 'Unknown';
    const commentPhotoURL = anonymousComment ? '' : (dataUser.photoURL || '');

    await firestore()
      .collection('posts')
      .doc(activePostId)
      .collection('comments')
      .add({
        text: commentText.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: currentUid,
        username: commentUsername,
        photoURL: commentPhotoURL,
        anonymous: anonymousComment ? 'yes' : 'no',
      });

    setCommentText('');
  };

  const deleteComment = async (commentId: string) => {
    if (!activePostId) return;
    await firestore()
      .collection('posts')
      .doc(activePostId)
      .collection('comments')
      .doc(commentId)
      .delete();
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const isAnon = post.anonymous === 'yes';
    const liked = post.likes?.includes(currentUid!) ?? false;
    const saved = post.saves?.includes(currentUid!) ?? false;
    const avatarSource = isAnon ? DEFAULT_AVATAR : post.photoURL ? { uri: post.photoURL } : DEFAULT_AVATAR;

    return (
      <View style={styles.card}>
        <View style={styles.userRow}>
          <Image source={avatarSource} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{isAnon ? 'Anonymous' : `@${post.username}`}</Text>
            <Text style={styles.time}>{post.createdAt?.toDate ? dayjs(post.createdAt.toDate()).fromNow() : 'Just now'}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postLocation}>{post.location}</Text>
        <Text style={styles.postDesc}>{post.description}</Text>
        <Image source={{ uri: post.imageUrl }} style={styles.postImg} />

        <View style={styles.iconRow}>
          <View style={styles.iconWithCount}>
            <Text style={styles.countText}>{commentCounts[post.id] ?? 0}</Text>
            <TouchableOpacity onPress={() => openComments(post.id)}>
              <Icon name="chatbubble-outline" size={22} />
            </TouchableOpacity>
          </View>
          <View style={styles.iconWithCount}>
            <Text style={styles.countText}>{post.likes?.length ?? 0}</Text>
            <TouchableOpacity onPress={() => toggleLike(post)}>
              <Icon name={liked ? 'thumbs-up' : 'thumbs-up-outline'} size={22} color={liked ? '#C95792' : undefined} />
            </TouchableOpacity>
          </View>
          <View style={styles.iconWithCount}>
            <Text style={styles.countText}>{post.saves?.length ?? 0}</Text>
            <TouchableOpacity onPress={() => toggleSave(post)}>
              <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? '#7C4585' : undefined} />
            </TouchableOpacity>
          </View>
            <TouchableOpacity onPress={() => {}}>
              <Icon name="share-social-outline" size={22} />
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Posts</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF7F6C" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
        />
      )}
     <Modal visible={!!activePostId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {commentsLoading ? (
              <ActivityIndicator size="large" color="#FF7F6C" />
            ) : (
              <FlatList
                data={comments}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={item.anonymous === 'yes' || !item.photoURL ? DEFAULT_AVATAR : { uri: item.photoURL }}
                        style={styles.avatar}
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.username}>{item.anonymous === 'yes' ? 'Anonymous' : `@${item.username}`}</Text>
                        <Text style={styles.time}>{item.createdAt?.toDate ? dayjs(item.createdAt.toDate()).fromNow() : 'Just now'}</Text>
                      </View>
                      {item.userId === currentUid && (
                        <TouchableOpacity onPress={() => deleteComment(item.id)}>
                          <Icon name="trash-outline" size={20} color="#cc1414" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={{ marginTop: 4 }}>{item.text}</Text>
                  </View>
                )}
                keyExtractor={item => item.id}
              />
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Switch
                value={anonymousComment}
                onValueChange={setAnonymousComment}
              />
              <Text style={{ marginLeft: 6 }}>Post anonymously</Text>
            </View>
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
    </View>
  );
};

export default SavedPostsScreen;

const styles = StyleSheet.create({
  // ... keep your existing styles ...
   container: { 
    flex: 1, 
    backgroundColor: '#eaf4f7', 
    paddingTop: 50 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 25,
  },
  backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 80,
    marginBottom: 20,
  },
  scrollContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 100 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16 
  },
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  avatar: { 
    width: 35, 
    height: 35, 
    borderRadius: 20, 
    marginRight: 10 
  },
  username: { 
    fontWeight: 'bold' 
  },
  time: { 
    fontSize: 12, 
    color: '#666' 
  },
  postTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4, 
    color: '#333' 
  },
  postLocation: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 4 
  },
  postDesc: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 8 
  },
  postImg: { 
    width: '100%', 
    height: 150, 
    borderRadius: 12, 
    marginBottom: 10 
  },
  iconRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 10 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  commentItem: { 
    paddingVertical: 4, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#ccc' 
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 40,
    backgroundColor: '#fff',
  },
  closeBtn: { 
    alignSelf: 'center', 
    marginTop: 10 
  },
  closeText: { 
    color: 'red', 
    fontWeight: '600' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    color: '#555',
    marginRight: 2,
  },
  // ...
});
