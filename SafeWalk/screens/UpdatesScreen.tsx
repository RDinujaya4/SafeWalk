import React, {useEffect, useState, useRef} from 'react';
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
  ActivityIndicator,
  Animated,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {RootStackParamList} from '../App';

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

const DEFAULT_AVATAR = require('../assets/default-avatar.png');

const UpdatesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UpdatesRouteProp>();
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(
    route.params?.postId ?? null,
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const postRefs = useRef<Record<string, number>>({});
  const currentUid = auth().currentUser?.uid;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [anonymousComment, setAnonymousComment] = useState(false);
  const commentsUnsubscribeRef = useRef<() => void | null>(null);
  const commentListenersRef = useRef<Record<string, () => void>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribePosts = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            likes: data.likes || [],
            saves: data.saves || [],
          };
        }) as Post[];

        Object.values(commentListenersRef.current).forEach(unsub => unsub?.());
        commentListenersRef.current = {};

        fetchedPosts.forEach(post => {
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

        setPosts(fetchedPosts.map(p => ({...p, commentsCount: 0})));
        setLoadingPosts(false);
      });

    return () => {
      unsubscribePosts();
      Object.values(commentListenersRef.current).forEach(unsub => unsub?.());
    };
  }, []);

  useEffect(() => {
    if (highlightedPostId) {
      setTimeout(() => {
        if (postRefs.current[highlightedPostId]) {
          scrollViewRef.current?.scrollTo({
            y: postRefs.current[highlightedPostId] - 10,
            animated: true,
          });
        }
      }, 600);
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setHighlightedPostId(null);
          fadeAnim.setValue(0);
        });
      }, 2500);
      return () => {
        clearTimeout(timer);
        fadeAnim.setValue(0);
      };
    }
  }, [highlightedPostId]);

  const toggleLike = async (post: Post) => {
    const uid = currentUid || '';
    const newLikes = post.likes?.includes(uid)
      ? firestore.FieldValue.arrayRemove(uid)
      : firestore.FieldValue.arrayUnion(uid);
    await firestore()
      .collection('posts')
      .doc(post.id)
      .update({likes: newLikes});
  };

  const toggleSave = async (post: Post) => {
    const uid = currentUid || '';
    const newSaves = post.saves?.includes(uid)
      ? firestore.FieldValue.arrayRemove(uid)
      : firestore.FieldValue.arrayUnion(uid);
    await firestore()
      .collection('posts')
      .doc(post.id)
      .update({saves: newSaves});
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
        const cmts = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<Comment, 'id'>;
          return {id: doc.id, ...data};
        });

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
    const docUser = await firestore()
      .collection('users')
      .doc(currentUid!)
      .get();
    const dataUser = docUser.data() || {};
    const commentUsername = anonymousComment
      ? 'Anonymous'
      : dataUser.username || 'Unknown';
    const commentPhotoURL = anonymousComment ? '' : dataUser.photoURL || '';

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
  const filteredPosts = posts.filter(
    post =>
      post.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Updates</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon
          name="search-outline"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}>
        {filteredPosts.map(post => {
          const isAnon = post.anonymous === 'yes';
          const liked = post.likes?.includes(currentUid!) ?? false;
          const saved = post.saves?.includes(currentUid!) ?? false;
          const avatarSource = isAnon
            ? DEFAULT_AVATAR
            : post.photoURL
            ? {uri: post.photoURL}
            : DEFAULT_AVATAR;

          const isHighlighted = highlightedPostId === post.id;

          return (
            <View
              key={post.id}
              style={styles.card}
              onLayout={event => {
                postRefs.current[post.id] = event.nativeEvent.layout.y;
              }}>
              {isHighlighted && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      borderColor: '#4ca0af',
                      borderWidth: 2.5,
                      borderRadius: 12,
                      opacity: fadeAnim,
                    },
                  ]}
                />
              )}

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
              <Image source={{uri: post.imageUrl}} style={styles.postImg} />

              <View style={styles.iconRow}>
                <View style={styles.iconWithCount}>
                  <Text style={styles.countText}>
                    {commentCounts[post.id] ?? 0}
                  </Text>
                  <TouchableOpacity onPress={() => openComments(post.id)}>
                    <Icon name="chatbubble-outline" size={22} />
                  </TouchableOpacity>
                </View>
                <View style={styles.iconWithCount}>
                  <Text style={styles.countText}>
                    {post.likes?.length ?? 0}
                  </Text>
                  <TouchableOpacity onPress={() => toggleLike(post)}>
                    <Icon
                      name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={22}
                      color={liked ? '#C95792' : undefined}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.iconWithCount}>
                  <Text style={styles.countText}>
                    {post.saves?.length ?? 0}
                  </Text>
                  <TouchableOpacity onPress={() => toggleSave(post)}>
                    <Icon
                      name={saved ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color={saved ? '#7C4585' : undefined}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => {}}>
                  <Icon name="share-social-outline" size={22} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!activePostId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {commentsLoading ? (
              <ActivityIndicator size="large" color="#FF7F6C" />
            ) : (
              <FlatList
                data={comments}
                renderItem={({item}) => (
                  <View style={styles.commentItem}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        source={
                          item.anonymous === 'yes' || !item.photoURL
                            ? DEFAULT_AVATAR
                            : {uri: item.photoURL}
                        }
                        style={styles.avatar}
                      />
                      <View style={{marginLeft: 10, flex: 1}}>
                        <Text style={styles.username}>
                          {item.anonymous === 'yes'
                            ? 'Anonymous'
                            : `@${item.username}`}
                        </Text>
                        <Text style={styles.time}>
                          {item.createdAt?.toDate
                            ? dayjs(item.createdAt.toDate()).fromNow()
                            : 'Just now'}
                        </Text>
                      </View>
                      {item.userId === currentUid && (
                        <TouchableOpacity
                          onPress={() => deleteComment(item.id)}>
                          <Icon
                            name="trash-outline"
                            size={20}
                            color="#cc1414"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={{marginTop: 4}}>{item.text}</Text>
                  </View>
                )}
                keyExtractor={item => item.id}
              />
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Switch
                value={anonymousComment}
                onValueChange={setAnonymousComment}
              />
              <Text style={{marginLeft: 6}}>Post anonymously</Text>
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

export default UpdatesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf4f7',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 95,
    marginBottom: 20,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#4ca0af',
  },
  backButton: {
    marginRight: 15,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  userRow: {
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
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  postLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  postDesc: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  postImg: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
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
  pin: {
    position: 'absolute',
    top: 5,
    right: 7,
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
    marginTop: 10,
  },
  closeText: {
    color: 'red',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
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
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    marginVertical: 20,
    width: 360,
    marginLeft: 17,
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
});
