import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'JoinParty'>;

export default function JoinPartyScreen({ navigation }: Props) {
  const [partyCode, setPartyCode] = useState('');

  const handleJoinParty = async () => {
    if (!partyCode.trim()) {
      Alert.alert('Error', 'Please enter a party code');
      return;
    }
    // TODO: Implement party joining logic
    Alert.alert('Join Party', 'Party joining functionality to be implemented');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Party</Text>
      <Text style={styles.subtitle}>
        Enter the party code to join your household adventure
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Party Code"
        value={partyCode}
        onChangeText={setPartyCode}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleJoinParty}>
        <Text style={styles.buttonText}>Join Party</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('CreateParty')}
      >
        <Text style={styles.linkText}>Don't have a party? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#f4511e',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#f4511e',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: '#f4511e',
    fontSize: 16,
    textAlign: 'center',
  },
}); 