import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { auth } from '../FirebaseConfig';
import { Image } from 'react-native'; 


export default function MessagingChat() {
  const { matchId, matchName } = useLocalSearchParams(); // Get match details from navigation params
  const [messages, setMessages] = useState<any[]>([]); // Store messages
  const [newMessage, setNewMessage] = useState<string>(""); // Store the new message input
  const [loading, setLoading] = useState<boolean>(false); // Loading state for sending messages

  const currentUserId = auth.currentUser?.uid; // Get the current user's ID

  // Fetch previous messages
  const fetchMessages = async () => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const response = await fetch(
        `http://127.0.0.1:5000/api/conversation?targetID=${matchId}`,
        {
          headers: token ? { Authorization: token } : undefined,
        }
      );
  
      if (response.ok) {
        const data = await response.json();
  
        // Sort messages by timestamp in ascending order
        const sortedMessages = data.messages.sort(
          (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
  
        setMessages(sortedMessages); // Set the sorted messages
      } else {
        console.error("Failed to fetch messages:", await response.json());
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
    setLoading(true);
  
    try {
      const token = await auth.currentUser?.getIdToken(true);
  
      // Log matchId and newMessage
      console.log("Sending message to:", matchId);
      console.log("Message content:", newMessage);
  
      const response = await fetch(`http://127.0.0.1:5000/api/message`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: token }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetID: matchId,
          message: newMessage,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Message sent successfully:", data);
  
        // Add the new message to the local state
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: data.messageID,
            text: newMessage,
            sender_id: currentUserId,
            timestamp: new Date().toISOString(),
          },
        ]);
        setNewMessage(""); // Clear the input field
      } else {
        console.error("Failed to send message:", await response.json());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when the component mounts
  useEffect(() => {
    fetchMessages();
  }, []);

  // Render each message
  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.sender_id === currentUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with {matchName}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
<TouchableOpacity
  style={styles.sendButton}
  onPress={sendMessage}
  disabled={loading}
  activeOpacity={0.7} // optional for better visual feedback
>
  <Image
    source={require('../assets/images/send.png')} // Make sure this path is correct
    style={styles.sendIcon}
    resizeMode="contain" // Helps avoid stretching
  />
</TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesContainer: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: "75%",
  },
  currentUserBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#F9F5F2",
  },
  otherUserBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E6DFF1",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    paddingHorizontal: 8,
  },
  sendButton: {
    marginLeft: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 30,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sendIcon: {
    width: 24, // Adjust the size as needed
    height: 24,
  },
});