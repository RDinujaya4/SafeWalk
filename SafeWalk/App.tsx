import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddPostScreen from './screens/AddPostScreen';
import NotificationsScreen from './screens/NotificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import UpdatesScreen from './screens/UpdatesScreen';
import UpdateMapScreen from './screens/UpdateMapScreen';
import SafetyMapScreen from './screens/SafetyMapScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';
import SavedPostsScreen from './screens/SavedPostsScreen';
import ManagePostsScreen from './screens/ManagePostsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  AdminLogin: undefined;
  AddPost: undefined;
  Notifications: undefined;
  Profile: undefined;
  Updates: { postId?: string };
  UpdateMap: undefined;
  SafetyMap: undefined;
  Map: undefined;
  AdminDashboard: undefined;
  Settings: undefined;
  SavedPosts: undefined;
  ManagePosts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AddPost" component={AddPostScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Updates" component={UpdatesScreen} />
        <Stack.Screen name="UpdateMap" component={UpdateMapScreen} />
        <Stack.Screen name="SafetyMap" component={SafetyMapScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
        <Stack.Screen name="ManagePosts" component={ManagePostsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
