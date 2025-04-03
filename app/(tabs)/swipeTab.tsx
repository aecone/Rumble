import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { auth, API_BASE_URL } from "../../FirebaseConfig";

type UserCard = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  birthday?: string;
  ethnicity?: string;
  gender?: string;
  pronouns?: string;
  bio?: string;
  profilePictureUrl?: string;
  major?: string;
  gradYear?: number;
  hobbies?: string[];
  orgs?: string[];
  careerPath?: string;
  interestedIndustries?: string[];
  mentorshipAreas?: string[];
};


export default function SwipeTab() {
  const [users, setUsers] = useState<UserCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async (filters = {}) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in.');
        return;
      }

      
      const token = await currentUser.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/suggested_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // ← if using Firebase Auth
        },
        body: JSON.stringify(filters), // can be empty
      });
    
      const data = await response.json();
      console.log(data.users);

      if (response.ok) {
        setUsers(data.users); // [{ id, firstName, major, bio }]
      } else {
        Alert.alert('Error', data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not load users.');
    }
  };

  const handleSwipeRight = async () => {
    const currentUser = auth.currentUser;
    const targetUser = users[currentIndex];
    if (!currentUser || !targetUser) return;

    try {
      const token = await currentUser.getIdToken(true);

      const response = await fetch(`${API_BASE_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          swiped_id: targetUser.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.match) {
          Alert.alert("🎉 It's a Match!", `You matched with ${targetUser.firstName}`);
        }
      } else {
        Alert.alert('Error', data.error || 'Swipe failed');
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Swipe error:', error);
      Alert.alert('Error', 'Swipe failed.');
    }
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const currentUserCard = users[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Swipe Stack</Text>

      {currentUserCard ? (
        <View style={styles.card}>
         <Text style={styles.name}>{currentUserCard.firstName}</Text>

            {currentUserCard.lastName && (
              <Text style={styles.info}>Last Name: {currentUserCard.lastName}</Text>
            )}
            {currentUserCard.ethnicity && (
              <Text style={styles.info}>Ethnicity: {currentUserCard.ethnicity}</Text>
            )}
            {currentUserCard.gender && (
              <Text style={styles.info}>Gender: {currentUserCard.gender}</Text>
            )}
            {currentUserCard.pronouns && (
              <Text style={styles.info}>Pronouns: {currentUserCard.pronouns}</Text>
            )}
            {currentUserCard.bio && (
              <Text style={styles.info}>Bio: {currentUserCard.bio}</Text>
            )}
            {currentUserCard.major && (
              <Text style={styles.info}>Major: {currentUserCard.major}</Text>
            )}
            {currentUserCard.gradYear && (
              <Text style={styles.info}>Graduation Year: {currentUserCard.gradYear}</Text>
            )}
            {currentUserCard.careerPath && (
              <Text style={styles.info}>Career Path: {currentUserCard.careerPath}</Text>
            )}
            {currentUserCard.hobbies && currentUserCard.hobbies.length > 0 && (
              <Text style={styles.info}>Hobbies: {currentUserCard.hobbies.join(", ")}</Text>
            )}
            {(currentUserCard.orgs?.length ?? 0) > 0 && (
              <Text style={styles.info}>Organizations: {currentUserCard.orgs?.join(", ")}</Text>
            )}
            {(currentUserCard.interestedIndustries ?? []).length > 0 && (
              <Text style={styles.info}>Industries: {(currentUserCard.interestedIndustries ?? []).join(", ")}</Text>
            )}
            {(currentUserCard.mentorshipAreas?.length ?? 0) > 0 && (
              <Text style={styles.info}>Mentorship Areas: {(currentUserCard.mentorshipAreas ?? []).join(", ")}</Text>
            )}
          

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.buttonText}>Skip 👎</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSwipeRight} style={styles.likeButton}>
              <Text style={styles.buttonText}>Like 👍</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>No more users to swipe on.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  card: {
    width: '90%',
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 30,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  skipButton: {
    backgroundColor: '#E57373',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  empty: {
    fontSize: 18,
    marginTop: 50,
    color: '#888',
  },
});
