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
  KeyboardAvoidingView,Alert,
  Platform,
} from "react-native";
import { auth, storage } from "../../FirebaseConfig";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { router } from 'expo-router'
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';


export default function TabFourScreen() {
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });
  const [profile, setProfile] = useState({
    firstName: "", 
    lastName: "",
    birthday: "",
    major: "",
    ethnicity: "",
    gender: "",
    pronouns: "",
    bio: "", 
    profile_picture_url: "" ,
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [refresh, setRefresh] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const handleUpdateCredentials = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // Validate Rutgers email
      if (newEmail !== '' && !newEmail.includes('rutgers.edu')) {
        alert('Please enter a valid Rutgers email (must contain rutgers.edu)');
        return;
      }
  
      // Update email if provided
      if (newEmail !== '') {
        await updateEmail(user, newEmail);
        setProfile((prev) => ({ ...prev, email: newEmail }));  // <-- Update profile state
      }
  
      // Update password if provided
      if (newPassword !== '') {
        await updatePassword(user, newPassword);
      }
  
      alert('Credentials updated successfully');
  
      // **Force user refresh**
      await user.reload();  // <-- Ensures latest user data
      setUser(auth.currentUser); // <-- Update state with latest user info
  
      // Fetch latest profile details
      fetchProfile();
  
      // Reset inputs and close modal
      setNewEmail('');
      setNewPassword('');
      setModalVisible(false);
  
    } catch (error: any) {
      console.error('Error updating credentials: ', error);
      alert('Error updating credentials: ' + error.message);
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchProfile();
      } else {
        setUser(null);
        setProfile({
          firstName: "", 
          lastName: "",
          birthday: "",
          major: "",
          ethnicity: "",
          gender: "",
          pronouns: "",
          bio: "", 
          profile_picture_url: "",
          email: "",
        });
      }
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchProfile();
    }, [user, refresh])
  );

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://127.0.0.1:5000/api/profile", {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.ok) {
        setProfile({ ...data, email: auth.currentUser?.email || "" });
      } else {
        console.error("Error fetching profile:", data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    console.log(profile);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://127.0.0.1:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData);
        setIsEditing(false);
        setRefresh((prev) => !prev);
      } else {
        console.error("Error updating profile:", await response.json());
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
    setLoading(false);
  };

  const [pendingImageUpdate, setPendingImageUpdate] = useState(false);

  const uploadImage = async (uri: string) => {
    if (!user) return;
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
          setProfile((prev) => ({ ...prev, profile_picture_url: downloadURL }));
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

  // useEffect to trigger updateProfile after profile_picture_url is updated
useEffect(() => {
  if (pendingImageUpdate) {
    updateProfile();
    // Reset the flag so it doesn't trigger again
    setPendingImageUpdate(false);
  }
}, [profile.profile_picture_url, pendingImageUpdate]);

  const deleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://127.0.0.1:5000/api/delete_account", {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
        },
      });
  
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        if (response.ok) {
          console.log("Account deleted, now signing out...");
          await auth.signOut();
          console.log("Successfully signed out, navigating...");
          
          router.dismissAll();
          router.replace("/");
        
          Alert.alert("Account Deleted", "Your account has been successfully deleted.");
        }
        
      } else {
        Alert.alert("Error", data.error || "Failed to delete account.");
      }
    } catch (error) {
      console.log("error");
      Alert.alert("Error", "Could not complete request.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>
            {loading && <ActivityIndicator size="large" color="#5C6BC0" />}
              <TouchableOpacity onPress={() => ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            }).then(result => {
              if (!result.canceled) {
  uploadImage(result.assets[0].uri);
  setProfile((prev) => ({ ...prev, profile_picture_url: result.assets[0].uri }));
}
            })}>
            <Image
              source={profile.profile_picture_url 
                ? { uri: profile.profile_picture_url } 
                : require('../../assets/images/profile.png')}              
              style={styles.profileImage}
            />
            <Text style={styles.imageText}>Tap to Change</Text>
          </TouchableOpacity>
            {Object.keys(profile).filter(key => key !== "profile_picture_url").map((key) => (
              <View key={key} style={styles.infoContainer}>
                <Text style={styles.label}>{key.replace("_", " ").toUpperCase()}:</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={profile[key]}
                    onChangeText={(text) => setProfile((prev) => ({ ...prev, [key]: text }))}
                    multiline
                  />
                ) : (
                  <Text style={styles.text}>{profile[key] || "N/A"}</Text>
                )}
              </View>
            ))}
            {isEditing ? (
              <TouchableOpacity style={styles.button} onPress={updateProfile}>
                <Text style={styles.buttonText}>Save Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.button, { backgroundColor: "#D9534F" }]} onPress={deleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Update Email and Password</Text>
      </TouchableOpacity>

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
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdateCredentials}>
              <Text style={styles.text}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#CCCCCC' }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.text}>Cancel</Text>
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40, // Prevents overlap with keyboard
  },
  infoContainer: {
    alignSelf: "stretch",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: "#5C6BC0",
  },
  imageText: {
    color: "gray",
    fontSize: 14,
  },
  input: {
    width: "80%",
    borderColor: "#5C6BC0",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    minHeight: 80,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5C6BC0",
    marginTop: 10,
    width: "60%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    justifyContent: "center",
    alignItems: "center",
  },
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
    backgroundColor: '#5C6BC0',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  }
});
