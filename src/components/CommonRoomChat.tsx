import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { BaseService } from '../services/baseService';
import { colors, spacing, typography } from '../theme';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface Activity {
  id: string;
  type: 'task' | 'achievement' | 'customization' | 'upgrade';
  memberId: string;
  memberName: string;
  description: string;
  timestamp: Date;
}

interface Props {
  baseId: string;
  currentUserId: string;
  currentUserName: string;
}

export const CommonRoomChat: React.FC<Props> = ({
  baseId,
  currentUserId,
  currentUserName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'activities'>('chat');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [chatData, activitiesData] = await Promise.all([
        BaseService.getBaseChat(baseId),
        BaseService.getBaseActivities(baseId),
      ]);
      setMessages(chatData.messages);
      setActivities(activitiesData.activities);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await BaseService.sendChatMessage(
        baseId,
        currentUserId,
        currentUserName,
        newMessage.trim()
      );
      setNewMessage('');
      loadData();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEmojiSelected = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.senderId === currentUserId && styles.ownMessage,
    ]}>
      <Text style={styles.senderName}>{item.senderName}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={styles.activityContainer}>
      <Text style={styles.activityType}>{item.type}</Text>
      <Text style={styles.activityDescription}>
        <Text style={styles.memberName}>{item.memberName}</Text>
        {' '}{item.description}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
            Activities
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            inverted
            style={styles.list}
          />
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => setShowEmojiPicker(true)}
            >
              <Text style={styles.emojiButtonText}>😊</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <Modal
            visible={showEmojiPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEmojiPicker(false)}
          >
            <View style={styles.emojiPickerContainer}>
              <View style={styles.emojiPickerHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowEmojiPicker(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
              <EmojiSelector
                onEmojiSelected={handleEmojiSelected}
                showSearchBar={false}
                showHistory={true}
                columns={8}
                category={Categories.all}
              />
            </View>
          </Modal>
        </>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
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
  list: {
    flex: 1,
  },
  messageContainer: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: 8,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  senderName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  messageContent: {
    ...typography.body1,
    color: colors.text,
  },
  activityContainer: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  activityType: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  activityDescription: {
    ...typography.body1,
    color: colors.text,
  },
  memberName: {
    fontWeight: 'bold',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.sm,
    marginRight: spacing.sm,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    ...typography.body1,
    color: colors.text,
  },
  emojiButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  emojiButtonText: {
    fontSize: 24,
  },
  emojiPickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 100,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    ...typography.body1,
    color: colors.primary,
  },
}); 