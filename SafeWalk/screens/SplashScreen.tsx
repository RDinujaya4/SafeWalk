import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../App';

const { height, width } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const logoTranslateX = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const slidePromptY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Parallel animation for logo & text
    Animated.sequence([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoTranslateX, {
          toValue: 20,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: -40,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(slidePromptY, {
            toValue: 10,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slidePromptY, {
            toValue: 30,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, []);

  // PanResponder for swipe-up gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -30,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          navigation.replace('IntroSlider');
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View style={[styles.row, { opacity: contentOpacity }]}>
        <Animated.Image
          source={require('../assets/logo.png')}
          style={[
            styles.logo,
            { transform: [{ translateX: logoTranslateX }] },
          ]}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.text,
            { transform: [{ translateX: textTranslateX }] },
          ]}
        >
          SafeWalk
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.slideUpPrompt,
          { transform: [{ translateY: slidePromptY }] },
        ]}
      >
        <Icon name="chevron-up-circle-outline" size={44} color="#3674B5" />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  text: {
    fontSize: 28,
    fontWeight: '400',
    color: '#3674B5',
    fontStyle: "italic"
  },
  slideUpPrompt: {
    position: 'absolute',
    bottom: height * 0.08,
  },
});
