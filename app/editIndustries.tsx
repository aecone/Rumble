import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth } from "../FirebaseConfig";
import { API_BASE_URL } from "../FirebaseConfig";

const predefinedIndustries = [
  "Technology", "Healthcare", "Finance", "Education", "Entertainment",
  "Retail", "Manufacturing", "Real Estate", "Transportation", "Energy",
  "Agriculture", "Media", "Telecommunications", "Hospitality", "Automotive",
  "Aerospace", "Pharmaceuticals", "Consulting", "Non-Profit", "Government",
];

const EditIndustries = () => {
  const [userProfile, setUserProfile] = useState<any>(null); // Store full user profile
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);
  // Fetch profile data when component mounts, setting specific industries
  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user || !API_BASE_URL) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data); // Store the full profile data
        
        // Initialize selected industries with user's current selections
        if (data.profile && data.profile.interestedIndustries) {
          setSelectedIndustries(data.profile.interestedIndustries);
        }
      } else {
        const errorData = await response.json();
        console.error("Error fetching profile:", errorData);
        Alert.alert("Error", "Failed to load profile data");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      Alert.alert("Error", "Network error while loading profile");
    } finally {
      setLoading(false);
    }
  };
  // Toggle industry selection
  const toggleIndustries = (area: string) => {
    setSelectedIndustries(prevIndustry =>
      prevIndustry.includes(area)
        ? prevIndustry.filter(i => i !== area)  // Remove if selected
        : [...prevIndustry, area]  // Add if not selected
    );
  };

  const saveIndustries = async () => {
    const user = auth.currentUser;
    if (!user || !API_BASE_URL || !userProfile) return;
  
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      
      // Create updated profile by starting with the existing profile
      // and only updating the industries
      const updatedProfile = {
        ...userProfile.profile, // Keep all existing profile properties
        interestedIndustries: selectedIndustries // Only update industries
      };
      
      const response = await fetch(`${API_BASE_URL}/update_profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updatedProfile),
      });
  
      if (response.ok) {
        Alert.alert("Success", "Industries updated successfully!");
        router.back();
      } else {
        const errorData = await response.json();
        console.error("Error updating industries:", errorData);
        Alert.alert("Error", "Failed to update industries. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update industries:", error);
      Alert.alert("Error", "An error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedIndustries.length > 0;

  // Show loading screen while fetching profile
  if (!userProfile && loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading profile data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Edit Your Interested Industry Areas</Text>
        <Text style={styles.subtitle}>Tap to select or deselect Industry Areas</Text>

        <View style={styles.listContainer}>
          <FlatList
            data={predefinedIndustries}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedIndustries.includes(item) ? styles.selectedChip : styles.unselectedChip
                ]}
                onPress={() => toggleIndustries(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedIndustries.includes(item) ? styles.selectedChipText : styles.unselectedChipText
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chipContainer}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isFormValid ? '#534E5B' : '#B0BEC5' }]}
          onPress={saveIndustries}
          disabled={!isFormValid || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditIndustries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
  listContainer: {
    marginVertical: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#534E5B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
    textAlign: 'center',
  },
  chipContainer: {
    paddingBottom: 20,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
    backgroundColor: '#534E5B', 
  },
  unselectedChip: {
    backgroundColor: '#E8EAF6', 
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  unselectedChipText: {
    color: '#534E5B',
  },
  button: {
    width: '70%',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});