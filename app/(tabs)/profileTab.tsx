import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";
import { auth, storage } from "../../FirebaseConfig";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { router } from 'expo-router';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
import { API_BASE_URL } from "../../FirebaseConfig";

export default function TabFourScreen() {
  // Check if user is authenticated
  getAuth().onAuthStateChanged((user) => {
    // If user is not authenticated, redirect to login page (temp solution, use global state later)
    if (!user) router.replace('/');
  });
  
  // Define types for profile 
  type Profile = {
    bio: string;
    profilePictureUrl: string;
    major: string;
    gradYear: number | null;
    hobbies: string[];
    orgs: string[];
    careerPath: string;
    interestedIndustries: string[];
    userType: string;
    mentorshipAreas: string[];
  };
  
  // Define the settings type
  type Settings = {
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    ethnicity: string;
    gender: string;
    pronouns: string;
  };
  
  // Define user profile type - made up of settings and profile types
  type UserProfile = {
    settings: Settings;
    profile: Profile;
  };
  
  // State variables 
  const [userProfile, setUserProfile] = useState<UserProfile>({
    settings: {
      firstName: "",
      lastName: "",
      email: "",
      birthday: "",
      ethnicity: "",
      gender: "",
      pronouns: "",
    },
    profile: {
      bio: "",
      profilePictureUrl: "",
      major: "",
      gradYear: null,
      hobbies: [],
      orgs: [],
      careerPath: "",
      interestedIndustries: [],
      userType: "TBD",
      mentorshipAreas: [],
    },
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [refresh, setRefresh] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Navigation handlers
  const navigateToSettings = () => {
    router.push('/Settings');
  };

  const navigateToEditIndustries = () => {
    router.push('/editIndustries');
  };

  const navigateToEditHobbies = () => {
    router.push('/editHobbies');
  };

  const navigateToEditMentorship = () => {
    router.push('/editMentorship');
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Update settings first
      await updateSettings();
      // Then update profile
      await updateProfile();
      
      // Provide feedback to the user
      Alert.alert("Success", "Your profile has been updated successfully!");
    } catch (error) {
      console.error("Error during save operation:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchProfile();
      } else {
        setUser(null);
        setUserProfile({
          settings: {
            firstName: "",
            lastName: "",
            email: "",
            birthday: "",
            ethnicity: "",
            gender: "",
            pronouns: "",
          },
          profile: {
            bio: "",
            profilePictureUrl: "",
            major: "",
            gradYear: null,
            hobbies: [],
            orgs: [],
            careerPath: "",
            interestedIndustries: [],
            userType: "TBD",
            mentorshipAreas: [],
          },
        });
      }
    });
  
    return unsubscribe;
  }, []);
  
  // Fetch user profile when the component is focused
  useFocusEffect(
    useCallback(() => {
      if (user) fetchProfile();
    }, [user, refresh])
  );

  const fetchProfile = async () => {
    if (!user || !API_BASE_URL) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Profile fetched successfully:", data);
        setUserProfile({ 
          ...data, 
          settings: { ...data.settings, email: auth.currentUser?.email || "" } 
        });
      } else {
        const errorData = await response.json();
        console.error("Error fetching profile:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async () => {
    if (!user || !API_BASE_URL) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/update_profile`, {

        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(userProfile.profile),
      });
      if (response.ok) {
        setRefresh((prev) => !prev);
        setIsEditing(false);
      } else {
        console.error("Error updating profile:", await response.json());
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
    setLoading(false);
  };

  const updateSettings = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/update_settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(userProfile.settings),
      });
      if (response.ok) {
        setRefresh((prev) => !prev);
        setIsEditing(false);
      } else {
        console.error("Error updating settings:", await response.json());
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const [pendingImageUpdate, setPendingImageUpdate] = useState(false);

  const uploadImage = async (uri: string) => {
    if (!user || !API_BASE_URL) return;
    setLoading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, blob);
  
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed", error);
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Uploaded image URL:", downloadURL);
  
          // Update the profile state with the new URL
          setUserProfile((prev) => ({
            ...prev,
            profile: { ...prev.profile, profilePictureUrl: downloadURL },
          }));
          // Set flag to trigger updateProfile after state change
          setPendingImageUpdate(true);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoading(false);
    }
  };

  // useEffect to trigger updateProfile after profilePictureUrl is updated
  useEffect(() => {
    if (pendingImageUpdate) {
      updateProfile();
      // Reset the flag so it doesn't trigger again
      setPendingImageUpdate(false);
    }
  }, [userProfile.profile.profilePictureUrl, pendingImageUpdate]);

  // Format array data for display
  const formatArrayData = (data: string[]) => {
    if (!data || data.length === 0) return "N/A";
    return data.join(", ");
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Settings and Edit buttons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={navigateToSettings}
        >
          
          <Text style={styles.headerButtonText}>⚙️</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Profile</Text>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={toggleEditing}
        >
          <Text style={styles.headerButtonText}>{isEditing ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#534E5B" />}
            
            {/* Profile Header Section */}
            <View style={styles.profileHeader}>
              <TouchableOpacity 
                disabled={!isEditing}
                onPress={() => {
                  if (!isEditing) return;
                  ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  }).then(result => {
                    if (!result.canceled) {
                      uploadImage(result.assets[0].uri);
                      setUserProfile((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, profilePictureUrl: result.assets[0].uri },
                      }));
                    }
                  });
                }}
              >
                <Image
                  source={userProfile.profile.profilePictureUrl 
                    ? { uri: userProfile.profile.profilePictureUrl } 
                    : require('../../assets/images/profile.png')}
                  style={styles.profileImage}
                />
                <Text style={styles.imageText}>
                  {isEditing ? "Tap to Change" : ""}
                </Text>
              </TouchableOpacity>

              {/* Name Display */}
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>
                  {userProfile.settings.firstName} {userProfile.settings.lastName}
                </Text>
              
                
                {/* User Type (Mentor/Mentee) */}
                  <Text style={styles.userType}>
                    {userProfile.profile.userType || "TBD"}
                  </Text>
              
              </View>
            </View>

            {/* Four dedicated sections */}
            
            {/* 1. Bio Section */}
            <View style={[styles.sectionContainer, styles.bioSectionBackground]}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <View style={styles.sectionContent}>
                {isEditing ? (
                  <TextInput
                    style={styles.multilineInput}
                    value={userProfile.profile.bio}
                    onChangeText={(text) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, bio: text },
                      }))
                    }
                    multiline
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <Text style={styles.sectionText}>{userProfile.profile.bio || "No bio provided"}</Text>
                )}
              </View>
            </View>

            {/* 2. Hobbies and Interests Section */}
            <View style={[styles.sectionContainer, styles.hobbiesSectionBackground]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Hobbies/Interests</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={styles.cornerEditButton} 
                  onPress={navigateToEditHobbies}
                >
                  <Text style={styles.cornerEditButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, styles.sectionTextPadded]}>
                {/* Check if industries exists and is a non-empty array */}
                {userProfile.profile.hobbies && userProfile.profile.hobbies.length > 0
                  ? userProfile.profile.hobbies.map((hobby, index) => (
                      <View key={index} style={styles.industryChip}>
                        <Text style={styles.industryChipText}>{hobby}</Text>
                      </View>
                    ))
                  : 'No industries available'}
              </Text>
            </View>
          </View>

            {/* 3. Mentorship Areas Section */}
            <View style={[styles.sectionContainer, styles.mentorshipSectionBackground]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Mentorship Areas</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={styles.cornerEditButton} 
                  onPress={navigateToEditMentorship}
                >
                  <Text style={styles.cornerEditButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, styles.sectionTextPadded]}>
                {/* Check if mentorshipAreas exists and is a non-empty array */}
                {userProfile.profile.mentorshipAreas && userProfile.profile.mentorshipAreas.length > 0
                  ? userProfile.profile.mentorshipAreas.map((mentorship, index) => (
                      <View key={index} style={styles.industryChip}>
                        <Text style={styles.industryChipText}>{mentorship}</Text>
                      </View>
                    ))
                  : 'No mentorship areas available'}
              </Text>
            </View>
          </View>




            {/* 4. Interested Industries Section */}
            <View style={[styles.sectionContainer, styles.industriesSectionBackground]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Interested Industries</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={styles.cornerEditButton} 
                  onPress={navigateToEditIndustries}
                >
                  <Text style={styles.cornerEditButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, styles.sectionTextPadded]}>
                {/* Check if industries exists and is a non-empty array */}
                {userProfile.profile.interestedIndustries && userProfile.profile.interestedIndustries.length > 0
                  ? userProfile.profile.interestedIndustries.map((industry, index) => (
                      <View key={index} style={styles.industryChip}>
                        <Text style={styles.industryChipText}>{industry}</Text>
                      </View>
                    ))
                  : 'No industries available'}
              </Text>
            </View>
          </View>




            {/* Action Buttons */}
            {isEditing ? (
              <TouchableOpacity style={styles.saveButton} onPress={() => {
                updateSettings();
                updateProfile();
              }}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            ) : null}
            
        
            {/* Credentials Update Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Update Credentials</Text>
                  <TextInput 
                    placeholder="New Email"
                    value={newEmail}
                    onChangeText={setNewEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TextInput 
                    placeholder="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    style={styles.input}
                  />
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: '#CCCCCC' }]} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#534E5B',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 15,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  
  // Profile Header Styles
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#534E5B",
  },
  imageText: {
    color: "gray",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 5,
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  userType: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 3,
    fontWeight: "300",
    textAlign: "center",
    textTransform: "uppercase",
  
    backgroundColor: "#534E5B", // ← light gray background
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 30,
    overflow: "hidden", // ← required in React Native for rounded corners to clip background
  },
  
  // Section Styles
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,     
    alignSelf: "center",     // ← center this box horizontally
    width: "100%",
  },

  // Add these to your StyleSheet
  bioSectionBackground: {
    backgroundColor: "#C0DEDD", // Light green
  },
  hobbiesSectionBackground: {
    backgroundColor: "#F1DFDE", // Light blue
  },
  mentorshipSectionBackground: {
    backgroundColor: "#E6DFF1", // Light orange
  },
  industriesSectionBackground: {
    backgroundColor: "#F4F0C3", // Light purple
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  sectionContent: {
    paddingHorizontal: 5,
  },
  sectionText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
    flexDirection: 'row', // Ensure the text is wrapped in a row
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    
  },
  sectionTextPadded: {
    overflow: "hidden", // ← required in React Native for rounded corners to clip background
  },
  industryChip: {
    backgroundColor: '#fFFFFF', 
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 7,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  industryChipText: {
    color: '#534E5B',
    fontSize: 14,
    fontWeight: '400',
  },

  commaSeparator: {
    color: '#534E5B',
    fontSize: 16,
    marginHorizontal: 5,
  },
  
  multilineInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    minHeight: 50,
    fontSize: 16,
  },
  
  // Button Styles
  actionButtonsContainer: {
    marginTop: 10,
  },
  saveButton: {
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#534E5B",
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "40%",
    alignContent: "center",
    alignSelf: "center",
  },
  button: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#534E5B",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4, 
    elevation: 3,
    width: "20%",            // ← half the screen width
    alignSelf: "center", 
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Original styles preserved for backwards compatibility
  infoContainer: {
    alignSelf: "stretch",
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: "#534E5B",
  },
  input: {
    borderColor: "#534E5B",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    minHeight: 50,
    width: "100%",
    marginTop: 5,
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 15,
    color: '#1A237E',
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#534E5B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  cornerEditButton: {
    padding: 4,
    borderRadius: 4,
  },
  cornerEditButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '300',
  },
});
