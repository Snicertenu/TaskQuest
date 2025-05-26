import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BaseService } from '../../services/baseService';
import { PartyBase, BaseCustomization, RoomCustomization } from '../../types';
import { colors, spacing, typography } from '../../theme';
import { CommonRoomChat } from '../../components/CommonRoomChat';

interface RouteParams {
  partyId: string;
  memberId: string;
  memberName: string;
  isPartyLeader: boolean;
}

export const PartyBaseScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { partyId, memberId, memberName, isPartyLeader } = route.params as RouteParams;
  const [base, setBase] = useState<PartyBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'common' | 'rooms' | 'chat'>('common');

  useEffect(() => {
    loadBase();
  }, []);

  const loadBase = async () => {
    try {
      const baseData = await BaseService.getBase(partyId);
      setBase(baseData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load party base');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCommonRoom = async () => {
    if (!base) return;
    try {
      await BaseService.enterCommonRoom(base.id, memberId);
      await BaseService.addBaseActivity(
        base.id,
        'customization',
        memberId,
        memberName,
        'entered the common room'
      );
      loadBase();
    } catch (error) {
      Alert.alert('Error', 'Failed to enter common room');
    }
  };

  const handleLeaveCommonRoom = async () => {
    if (!base) return;
    try {
      await BaseService.leaveCommonRoom(base.id, memberId);
      await BaseService.addBaseActivity(
        base.id,
        'customization',
        memberId,
        memberName,
        'left the common room'
      );
      loadBase();
    } catch (error) {
      Alert.alert('Error', 'Failed to leave common room');
    }
  };

  const renderCommonRoom = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Common Room</Text>
      <View style={styles.commonRoom}>
        <Image
          source={{ uri: base?.type === 'tavern' ? 'tavern_common_room' : 'house_common_room' }}
          style={styles.roomImage}
        />
        <View style={styles.activeMembers}>
          <Text style={styles.membersTitle}>Active Members:</Text>
          {base?.commonRoom.activeMembers.map(memberId => (
            <Text key={memberId} style={styles.memberName}>
              {memberId} {/* Replace with actual member name */}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={base?.commonRoom.activeMembers.includes(memberId)
            ? handleLeaveCommonRoom
            : handleEnterCommonRoom}
        >
          <Text style={styles.actionButtonText}>
            {base?.commonRoom.activeMembers.includes(memberId)
              ? 'Leave Room'
              : 'Enter Room'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMemberRooms = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Member Rooms</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(base?.rooms || {}).map(([memberId, room]) => (
          <TouchableOpacity
            key={memberId}
            style={styles.roomCard}
            onPress={() => navigation.navigate('RoomDetails', { baseId: base?.id, memberId })}
          >
            <Image
              source={{ uri: room.isPrivate ? 'private_room' : 'public_room' }}
              style={styles.roomThumbnail}
            />
            <Text style={styles.roomName}>{memberId}'s Room</Text>
            <Text style={styles.roomStatus}>
              {room.isPrivate ? 'Private' : 'Public'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChat = () => (
    <View style={styles.chatContainer}>
      <CommonRoomChat
        baseId={base?.id || ''}
        currentUserId={memberId}
        currentUserName={memberName}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!base) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No base found for this party</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateBase', { partyId })}
        >
          <Text style={styles.createButtonText}>Create Base</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.baseName}>{base.name}</Text>
        <Text style={styles.baseType}>{base.type}</Text>
        <Text style={styles.baseLevel}>Level {base.level}</Text>
        {isPartyLeader && (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate('BaseManagement', { baseId: base.id, isPartyLeader })}
          >
            <Text style={styles.manageButtonText}>Manage Base</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'common' && styles.activeTab]}
          onPress={() => setSelectedTab('common')}
        >
          <Text style={[styles.tabText, selectedTab === 'common' && styles.activeTabText]}>
            Common Room
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rooms' && styles.activeTab]}
          onPress={() => setSelectedTab('rooms')}
        >
          <Text style={[styles.tabText, selectedTab === 'rooms' && styles.activeTabText]}>
            Member Rooms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'chat' && styles.activeTab]}
          onPress={() => setSelectedTab('chat')}
        >
          <Text style={[styles.tabText, selectedTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'common' && renderCommonRoom()}
      {selectedTab === 'rooms' && renderMemberRooms()}
      {selectedTab === 'chat' && renderChat()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  baseName: {
    ...typography.h1,
    color: colors.text,
  },
  baseType: {
    ...typography.body1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  baseLevel: {
    ...typography.body2,
    color: colors.primary,
  },
  manageButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  manageButtonText: {
    ...typography.body1,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  commonRoom: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  activeMembers: {
    marginBottom: spacing.md,
  },
  membersTitle: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  memberName: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.body1,
    color: colors.text,
  },
  roomCard: {
    width: 150,
    marginRight: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
  },
  roomThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  roomName: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roomStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
  },
  createButtonText: {
    ...typography.body1,
    color: colors.text,
  },
  chatContainer: {
    flex: 1,
  },
}); 