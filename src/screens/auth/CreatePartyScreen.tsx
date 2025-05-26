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

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateParty'>;

export default function CreatePartyScreen({ navigation }: Props) {
  const [partyName, setPartyName] = useState('');

  const handleCreateParty = async () => {
    if (!partyName.trim()) {
      Alert.alert('Error', 'Please enter a party name');
      return;
    }
    // TODO: Implement party creation logic
    Alert.alert('Create Party', 'Party creation functionality to be implemented');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Party</Text>
      <Text style={styles.subtitle}>
        Start your household adventure by creating a party
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Party Name"
        value={partyName}
        onChangeText={setPartyName}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateParty}>
        <Text style={styles.buttonText}>Create Party</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('JoinParty')}
      >
        <Text style={styles.linkText}>Already have a party? Join instead</Text>
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