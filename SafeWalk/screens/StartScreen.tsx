import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import {RootStackParamList} from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Start'>;
};

const StartScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <FastImage
        source={require('../assets/splash1.gif')}
        style={styles.image}
        resizeMode={FastImage.resizeMode.contain}
      />

      <Text style={styles.title}>SafeWalk</Text>
      <Text style={styles.subtitle}>We Secure Your World</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F9FF',
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
    fontWeight: '500',
    color: '#333',
  },
  subtitle: {
    fontSize: 19,
    fontWeight: '400',
    color: '#2C4E80',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#2E5077',
    backgroundColor: 'transparent',
    shadowColor: '#E8F9FF',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  buttonText: {
    color: '#2E5077',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StartScreen;
