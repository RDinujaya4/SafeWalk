import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';

const {width, height} = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to SafeWalk',
    description: 'Your personal safety companion for walking at night.',
    image: require('../assets/intro1.png'),
  },
  {
    key: '2',
    title: 'Live Updates',
    description: 'See real-time safety posts shared by others around you.',
    image: require('../assets/intro2.png'),
  },
  {
    key: '3',
    title: 'Report Anonymously',
    description: 'Post safety alerts with full privacy and no pressure.',
    image: require('../assets/intro3.png'),
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const IntroSliderScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({index: currentIndex + 1});
    } else {
      navigation.replace('Start');
    }
  };

  const renderItem = ({item}: {item: (typeof slides)[0]}) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={e => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
      }}
    />
  );
};

export default IntroSliderScreen;

const styles = StyleSheet.create({
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F9FF',
  },
  image: {
    width: width * 0.7,
    height: height * 0.4,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#2E5077',
    backgroundColor: 'transparent',
  },

  nextButtonText: {
    color: '#2E5077',
    fontSize: 16,
    fontWeight: '400',
  },
});
