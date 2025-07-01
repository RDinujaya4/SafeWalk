import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import {RootStackParamList} from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <FastImage
        source={require('../assets/splash.gif')}
        style={styles.image}
        resizeMode={FastImage.resizeMode.contain}
      />

      <Text style={styles.title}>SafeWalk</Text>
      <Text style={styles.subtitle}>We Secure Your{'\n'}World</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Get Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CDF2D3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
  },
  title: {
    fontSize: 33,
    fontWeight: 'bold',
    color: '#1A3C34',
  },
  subtitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1A3C34',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 90,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  buttonText: {
    color: '#1A3C34',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default SplashScreen;
