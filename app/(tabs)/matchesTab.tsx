import { StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { auth } from '../../FirebaseConfig';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { API_BASE_URL } from "../../FirebaseConfig";

export default function MatchesTab() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Define type for match
  type Match = {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
  };

  // Checks if user is authenticated; if not, sets user to null and redirects to login screen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchMatches();
      } else {
        setUser(null);
        router.replace('/');
      }
    });
    return unsubscribe;
  }, []);

  // Fetch matches from the backend
  const fetchMatches = async () => {
    if (!user || !API_BASE_URL) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/matches`, {
        headers: { Authorization: token },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Matches fetched successfully:", data);

        // Safely transform the matches data
        const transformedMatches = data.matches.map((match: any) => {

          const firstName = match?.settings?.firstName || "Unknown"; // Fallback if firstName is missing
          const lastName = match?.settings?.lastName || "Unknown"; // Fallback if lastName is missing
          const profilePictureUrl =
            match?.profile?.profilePictureUrl;
  
          return {
            id: match?.id || "", // Fallback to an empty string if id is missing
            firstName,
            lastName,
            profilePictureUrl,
          };
        });
  
        setMatches(transformedMatches);
      } else {
        const errorData = await response.json();
        console.error("Error fetching matches:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };
  // Render each match item
  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.matchItem}>
      <Image source={{ uri: item.profilePictureUrl }} style={styles.profilePicture} />
      <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
      <Image source={require('../../assets/images/messages-icon.png')} style={styles.messagesIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.loadingText}>No matches found.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 15,
  },
  listContainer: {
    padding: 30,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  messagesIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    right: 20,
  },
});
