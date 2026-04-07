import React from 'react';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/store';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/AuthScreens/LoginScreen';
import RegistrationScreen from './src/screens/AuthScreens/RegistrationScreen';
import UserDashboard from './src/screens/UserScreens/UserDashboard';
import SelectReceiverScreen from './src/screens/UserScreens/SelectReceiverScreen';
import SendMoneyScreen from './src/screens/UserScreens/SendMoneyScreen';
import TransactionVerificationScreen from './src/screens/UserScreens/TransactionVerificationScreen';
import TransactionHistoryScreen from './src/screens/UserScreens/TransactionHistoryScreen';
import AdminDashboard from './src/screens/AdminScreens/AdminDashboard';

const Stack = createNativeStackNavigator();

function AppContainer() {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user?.is_staff ? "AdminDashboard" : "UserDashboard"}
      >
        {user?.is_staff ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="UserDashboard" component={UserDashboard} />
          </>
        ) : (
          <>
            <Stack.Screen name="UserDashboard" component={UserDashboard} />
          </>
        )}
        <Stack.Screen name="SelectReceiver" component={SelectReceiverScreen} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
        <Stack.Screen name="TransactionVerification" component={TransactionVerificationScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppContainer />
    </Provider>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: '#000', // Outer background for desktop
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }
});
