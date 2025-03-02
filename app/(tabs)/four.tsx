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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth, storage } from "../../FirebaseConfig";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";

export default function TabFourScreen() {
  const [profile, setProfile] = useState({
    firstName: "", 
    lastName: "",
    birthday: "",
    major: "",
    ethnicity: "",
    gender: "",
    pronouns: "",
    bio: "", 
    profile_picture_url: "" 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [refresh, setRefresh] = useState(false);

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
          profile_picture_url: "" 
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
        setProfile(data);
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

    // Upload image to Firebase Storage
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
          console.log("Uploaded image URL:", downloadURL);  // Debugging log
          setProfile((prev) => ({ ...prev, profile_picture_url: downloadURL })); // ✅ Update immediately
          // Call updateProfile to save it to Firestore
          await updateProfile();
          setRefresh((prev) => !prev); // ✅ Force tab refresh
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
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
                if (!result.canceled) uploadImage(result.assets[0].uri);
              })}>
              <Image
                source={{ uri: profile.profile_picture_url || "https://via.placeholder.com/150" }}
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
  },
});
