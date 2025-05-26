import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { PartyMember } from '../../types';

type Props = NativeStackScreenProps<MainTabParamList, 'Party'>;

export default function PartyScreen({ navigation }: Props) {
  // TODO: Replace with actual data
  const partyMembers: PartyMember[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      level: 5,
      xp: 1250,
      gold: 500,
      inventory: [],
      isPartyLeader: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      level: 4,
      xp: 980,
      gold: 350,
      inventory: [],
      isPartyLeader: false,
    },
  ];

  const renderMember = (member: PartyMember) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {member.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
        </View>
        {member.isPartyLeader && (
          <View style={styles.leaderBadge}>
            <Text style={styles.leaderText}>Leader</Text>
          </View>
        )}
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statValue}>{member.level}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{member.xp}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Gold</Text>
          <Text style={styles.statValue}>{member.gold}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Party Members</Text>
        <Text style={styles.subtitle}>
          {partyMembers.length} members in your household
        </Text>
      </View>
      {partyMembers.map(renderMember)}
      <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteButtonText}>Invite Member</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f4511e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  memberCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  leaderBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  leaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inviteButton: {
    backgroundColor: '#f4511e',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 