import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";
import { auth, storage } from "../FirebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged, updateEmail, updatePassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { router } from 'expo-router';
import { API_BASE_URL } from "../FirebaseConfig";

// Helper function to check if email already exists in Firebase
const checkEmailExists = async (email: string) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return signInMethods.length > 0;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

export default function Settings() {
  // Define types for settings and profile
  type Settings = {
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    ethnicity: string;
    gender: string;
    pronouns: string;
  };

  // State management
  const [settings, setSettings] = useState<Settings>({
    firstName: "",
    lastName: "",
    email: "",
    birthday: "",
    ethnicity: "",
    gender: "",
    pronouns: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [newPassword, setNewPassword] = useState('');


  // Check if email is valid Rutgers address and not already registered
  const checkEmail = async (email: string) => {
    const validDomains = ["@rutgers.edu", "@scarletmail.rutgers.edu"];
    const atIndex = email.indexOf("@");
    
    const isValidRutgersEmail = 
      atIndex !== -1 &&
      validDomains.some((domain) => email.toLowerCase().endsWith(domain)) &&
      email.indexOf("@") === email.lastIndexOf("@"); // only one "@"
    
    try {
      if (!isValidRutgersEmail) {
        alert("Please use a valid Rutgers email address.");
        return false;
      }
      
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        alert("This email is already registered. Please sign in or use a different email.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      alert("An error occurred while checking the email. Please try again.");
      return false;
    }
  };

  // Toggle between view and edit modes
  const toggleEditing = () => {
    if (isEditing) {
      // Cancel editing - restore original values
      fetchProfile();
      setNewEmail('');
      setEmailChanged(false);
      setNewPassword('');
    } else {
      // Start editing - prefill email field
      setNewEmail(user?.email || '');
    }
    setIsEditing(!isEditing);
  };

  // Save updated settings
  const handleSaveChanges = async () => {
    if (!isValidDate(settings.birthday)) {
      alert('Please enter a valid date in MM/DD/YYYY format.');
      return;
    }
  
    if (emailChanged && !newEmail) {
      alert('Please enter a valid email address.');
      return;
    }
  
    setLoading(true);
    try {
      // Handle email update if changed
      if (emailChanged && newEmail !== settings.email) {
        const emailValid = await checkEmail(newEmail);
        if (!emailValid) {
          setNewEmail(settings.email);
          setEmailChanged(false);
          return;
        }
  
        if (user) await updateEmail(user, newEmail);
        setSettings((prev) => ({ ...prev, email: newEmail }));
      }
  
      await updateSettings();
      Alert.alert("Success", "Your settings have been updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error during save operation:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Form validation
  const isFormValid = () => {
    const validBirthday = isValidDate(settings.birthday);
    const lowerEmail = newEmail.toLowerCase();
    const validEmailFormat = lowerEmail.endsWith("@rutgers.edu") || lowerEmail.endsWith("@scarletmail.rutgers.edu") || !emailChanged;
    return validBirthday && validEmailFormat;
  };
  
  // Authentication listener
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchProfile();
      } else {
        setUser(null);
        setSettings({
          firstName: '',
          lastName: '',
          email: '',
          birthday: '',
          ethnicity: '',
          gender: '',
          pronouns: '',
        });
      }
    });
    }, []);
  
  // Fetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) fetchProfile();
    }, [user])
  );

  // Fetch user profile data from API
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
        setSettings({ 
          ...data.settings, 
          email: auth.currentUser?.email || "" 
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

  // Update settings in the backend
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
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setIsEditing(false);
        console.log("Settings updated successfully");
      } else {
        console.error("Error updating settings:", await response.json());
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  // Update user password
  const handleUpdateCredentials = async () => {
    const user = auth.currentUser;
    if (!user || !API_BASE_URL) return;
  
    try {
      // Validate password
      if (newPassword && newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      if (newPassword) {
        await updatePassword(user, newPassword);
      }
  
      // Refresh user data
      await user.reload();
      setUser(auth.currentUser);
      fetchProfile();
      setNewPassword('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating credentials: ', error);
      if (error instanceof Error) {
        alert('Error updating credentials: ' + error.message);
      } else {
        alert('Error updating credentials: An unknown error occurred.');
      }
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    console.log("Delete button pressed"); 
    if (!user || !API_BASE_URL) {
      console.log("Missing user or API_BASE_URL");  
      return;
    }
    console.log("Ready to show confirmation alert"); 

  
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await user.getIdToken(true);
              const response = await fetch(`${API_BASE_URL}/delete_account`, {
                method: "DELETE",
                headers: {
                  Authorization: `${token}`,
                },
              });
  
              const data = await response.json();
              if (response.ok) {
                console.log("Account deleted, now signing out...");
                await auth.signOut();
  
                router.dismissAll();
                router.replace("/");
  
                Alert.alert(
                  "Account Deleted",
                  "Your account has been successfully deleted."
                );
              } else {
                Alert.alert("Error", data.error || "Failed to delete account.");
              }
            } catch (error) {
              console.log("error", error);
              Alert.alert("Error", "Could not complete request.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  // Validate date format and value
  const isValidDate = (date: string) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/\d{4}$/;
    if (!regex.test(date)) return false;
    
    const [month, day, year] = date.split('/').map((num: string) => parseInt(num, 10));
    const dateObj = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day || dateObj.getFullYear() !== year) {
      return false;
    }

    // Ensure date is not in the future
    const currentDate = new Date();
    if (dateObj > currentDate) return false;

    return true;
  };

  // Render picker options for ethnicity
  const renderEthnicityOptions = () => (
    <>
      <Picker.Item label="Select Race/Ethnicity" value="" />
      <Picker.Item label="Asian" value="Asian" />
      <Picker.Item label="East Asian" value="East Asian" />
      <Picker.Item label="South Asian" value="South Asian" />
      <Picker.Item label="Southeast Asian" value="Southeast Asian" />
      <Picker.Item label="Middle Eastern/Arab" value="Middle Eastern/Arab" />
      <Picker.Item label="American Indian/Alaskan Native" value="American Indian/Alaskan Native" />
      <Picker.Item label="African American" value="African American" />
      <Picker.Item label="Native Hawaiian or Pacific Islander" value="Native Hawaiian or Pacific Islander" />
      <Picker.Item label="Hispanic or Latino" value="Hispanic or Latino" />
      <Picker.Item label="White" value="White" />
      <Picker.Item label="Multiracial" value="Multiracial" />
      <Picker.Item label="Prefer not to say" value="Prefer not to say" />
      <Picker.Item label="Other" value="Other" />
    </>
  );

  // Render picker options for gender
  const renderGenderOptions = () => (
    <>
      <Picker.Item label="Select Gender" value="" />
      <Picker.Item label="Woman" value="Woman" />
      <Picker.Item label="Man" value="Man" />
      <Picker.Item label="Non-binary" value="Non-binary" />
      <Picker.Item label="Genderfluid" value="Genderfluid" />
      <Picker.Item label="Prefer not to say" value="Prefer not to say" />
      <Picker.Item label="Other" value="Other" />
    </>
  );

  // Render picker options for pronouns
  const renderPronounOptions = () => (
    <>
      <Picker.Item label="Select Pronouns" value="" />
      <Picker.Item label="He/Him" value="He/Him" />
      <Picker.Item label="She/Her" value="She/Her" />
      <Picker.Item label="They/Them" value="They/Them" />
      <Picker.Item label="He/They" value="He/They" />
      <Picker.Item label="She/They" value="She/They" />
      <Picker.Item label="Ze/Hir" value="Ze/Hir" />
      <Picker.Item label="Ze/Zir" value="Ze/Zir" />
      <Picker.Item label="Xe/Xem" value="Xe/Xem" />
      <Picker.Item label="Prefer not to say" value="Prefer not to say" />
      <Picker.Item label="Other" value="Other" />
    </>
  );

  // Render edit form fields
  const renderEditForm = () => (
    <>
      <Text style={styles.settingLabel}>First Name:</Text>
      <TextInput
        style={styles.input}
        value={settings.firstName || ''}
        onChangeText={(text) => setSettings({ ...settings, firstName: text })}
      />
      
      <Text style={styles.settingLabel}>Last Name:</Text>
      <TextInput
        style={styles.input}
        value={settings.lastName || ''}
        onChangeText={(text) => setSettings({ ...settings, lastName: text })}
      />
      
      <Text style={styles.settingLabel}>Email:</Text>
      <TextInput
        style={styles.input}
        value={newEmail || settings.email}
        onChangeText={(text) => {
          setNewEmail(text);
          setEmailChanged(text !== settings.email);
        }}
        keyboardType="email-address"
      />

      <Text style={styles.settingLabel}>Birthday:</Text>
      <TextInput
        style={styles.input}
        value={settings.birthday || ''}
        onChangeText={(text) => setSettings({ ...settings, birthday: text })}
        placeholder="MM/DD/YYYY"
      />
      
      <Text style={styles.settingLabel}>Ethnicity:</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={settings.ethnicity || ''}
          onValueChange={(itemValue) => setSettings({ ...settings, ethnicity: itemValue })}
          style={[styles.dropdownSettingContent, { borderWidth: 0, backgroundColor: 'transparent', outline: 'none', color: '#000000'}]}
          >
          {renderEthnicityOptions()}
        </Picker>
      </View>
      
      <Text style={styles.settingLabel}>Gender:</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={settings.gender || ''}
          onValueChange={(itemValue) => setSettings({ ...settings, gender: itemValue })}
          style={[styles.dropdownSettingContent, { borderWidth: 0, backgroundColor: 'transparent', outline: 'none', color: '#000000'}]}
          >
          {renderGenderOptions()}
        </Picker>
      </View>

      <Text style={styles.settingLabel}>Pronouns:</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={settings.pronouns || ''}
          onValueChange={(itemValue) => setSettings({ ...settings, pronouns: itemValue })}
          style={[styles.dropdownSettingContent, { borderWidth: 0, backgroundColor: 'transparent', outline: 'none', color: '#000000'}]}
          >
          {renderPronounOptions()}
        </Picker>
      </View>
      
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: isFormValid() ? '#534E5B' : '#B0BEC5' }]}
        onPress={handleSaveChanges}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </>
  );

  // Render view-only profile fields
  const renderProfile = () => (
    <>
      <Text style={styles.settingLabel}>First Name:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.firstName}</Text>
      </View>
      
      <Text style={styles.settingLabel}>Last Name:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.lastName}</Text>
      </View>
      
      <Text style={styles.settingLabel}>Email:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.email}</Text>
      </View>
      
      <Text style={styles.settingLabel}>Birthday:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.birthday}</Text>
      </View>
      
      <Text style={styles.settingLabel}>Ethnicity:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.ethnicity}</Text>
      </View>
      
      <Text style={styles.settingLabel}>Gender:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.gender}</Text>
      </View>
      
      <Text style={styles.settingLabel}>Pronouns:</Text>
      <View style={styles.displayField}>
        <Text style={styles.settingContent}>{settings.pronouns}</Text>
      </View>
    </>
  );

  // Render account management buttons
  const renderAccountButtons = () => (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteAccount} onPress={deleteAccount}>
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  // Password update modal
  const renderPasswordModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Password</Text>
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
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: '#CCCCCC' }]} 
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.text}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Edit/Cancel button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}></TouchableOpacity>
        <TouchableOpacity onPress={toggleEditing}>
          <Text style={styles.headerButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#534E5B" />}
            
            {/* Display either edit form or profile view */}
            {isEditing ? renderEditForm() : renderProfile()}
            
            {/* Password update modal */}
            {renderPasswordModal()}
            
            {/* Show account management buttons only in view mode */}
            {!isEditing && renderAccountButtons()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
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
  saveButton: {
    backgroundColor: '#534E5B',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: "50%",
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'black',
    borderRadius: 30,
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: 16,
  },
  settingContent: {
    fontSize: 16,
    marginVertical: 5,
    color: '#534E5B',
  },
  dropdownSettingContent: {
    fontSize: 16,
    color: '#534E5B',
  },
  settingLabel: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  button: {
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#534E5B",
    marginTop: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    width: "50%",
  },
  deleteAccount: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  deleteAccountText: {
    color: "#534E5B",
    fontWeight: "500",
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
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#534E5B',
    padding: 10,
    borderRadius: 30,
    width: "75%",
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: "white",
  },
  displayField: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'black',
    borderRadius: 30,
    paddingVertical: 7,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
});