import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LocalStorageProvider } from './src/contexts/LocalStorageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LocalStorageProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Root" component={RootNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocalStorageProvider>
  );
}
