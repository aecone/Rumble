import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { API_BASE_URL } from "../../FirebaseConfig";
import { useSignupStore } from "../utils/useSignupStore";
import { normalizeToArray, toggleValueInArray } from "../utils/signupHelpers";
import { signupStepPaths} from "../utils/routes";
import { useSignupNavigation } from "../hooks/useSignupNavigation";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
const predefinedMentorshipAreas = [
  "Career Advice",
  "Resume Review",
  "Interview Prep",
  "Networking",
  "Leadership",
  "Technical Skills",
  "Project Management",
  "Public Speaking",
  "Time Management",
  "Course Advisement",
  "Personal Branding",
  "Work-Life Balance",
  "Teamwork",
  "Career Transition",
  "Job Search",
  "Professional Development",
  "Industry Insights",
  "Skill Building",
];

const MenteeAreas = () => {
  const {
    firstName,
    lastName,
    email,
    password,
    birthday,
    major,
    gradYear,
    ethnicity,
    gender,
    pronouns,
    hobbies,
    careerPath,
    interestedIndustries,
    orgs,
  } = useSignupStore();

  const [selectedMentorshipAreas, setSelectedMentorshipAreas] = useState<string[]>([]);
  const mentorshipAreasArray = normalizeToArray(selectedMentorshipAreas);

  const toggleMentorshipArea = (area: string) => {
    setSelectedMentorshipAreas((prevAreas) => toggleValueInArray(prevAreas, area));
  };

  const handleSignUp = async () => {
    if (mentorshipAreasArray.length === 0) {
      Alert.alert("Error", "Please select at least one area of mentorship.");
      return;
    }

    try {
      const emailString = Array.isArray(email) ? email[0] : email;
      const passwordString = Array.isArray(password) ? password[0] : password;

      if (!emailString || !passwordString) {
        Alert.alert("Error", "Invalid email or password.");
        return;
      }

      // Prepare data for API call
      const gradYearString = Array.isArray(gradYear) ? gradYear[0] : gradYear;
      const gradYearNumber = gradYearString ? parseInt(gradYearString, 10) : null;
      const hobbiesArray = Array.isArray(hobbies) ? hobbies : hobbies ? String(hobbies).split(",").map((hobby) => hobby.trim()) : [];
      const industriesArray = Array.isArray(interestedIndustries) ? interestedIndustries : interestedIndustries ? String(interestedIndustries).split(",").map((industry) => industry.trim()) : [];
      const orgsArray = Array.isArray(orgs) ? orgs : orgs ? String(orgs).split(",").map((org) => org.trim()) : [];

      const userData = {
        email: emailString,
        password: passwordString,
        firstName: Array.isArray(firstName) ? firstName[0] : firstName,
        lastName: Array.isArray(lastName) ? lastName[0] : lastName,
        birthday: Array.isArray(birthday) ? birthday[0] : birthday,
        ethnicity: Array.isArray(ethnicity) ? ethnicity[0] : ethnicity,
        gender: Array.isArray(gender) ? gender[0] : gender,
        pronouns: Array.isArray(pronouns) ? pronouns[0] : pronouns || "",
        profilePictureUrl: "",
        major: Array.isArray(major) ? major[0] : major,
        gradYear: gradYearNumber,
        hobbies: hobbiesArray,
        orgs: orgsArray,
        careerPath: Array.isArray(careerPath) ? careerPath[0] : careerPath || "",
        interestedIndustries: industriesArray,
        userType: "mentee",
        mentorshipAreas: mentorshipAreasArray,
      };

      // Make the API call
      const response = await fetch(`${API_BASE_URL}/create_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText);
        data = { error: "Invalid server response" };
      }

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        useSignupStore.getState().reset();
        router.push("/signup/SuccessProfileCreation");
      } else {
        Alert.alert("Error", data.error || `Sign up failed (${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>What areas would you like mentorship in?</Text>
      <Text style={styles.subtitle}>
        Please select your areas of mentorship
      </Text>

      <View style={styles.listContainer}>
        <FlatList
          data={predefinedMentorshipAreas}
          numColumns={3}
          keyExtractor={(item: string) => item}
          renderItem={({ item }: { item: string }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                mentorshipAreasArray.includes(item)
                  ? styles.selectedChip
                  : styles.unselectedChip,
              ]}
              onPress={() => toggleMentorshipArea(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  mentorshipAreasArray.includes(item)
                    ? styles.selectedChipText
                    : styles.unselectedChipText,
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
        style={[
          styles.signupButton,
          {
            backgroundColor:
            mentorshipAreasArray.length > 0 ? "#FFFFFF" : "#B0BEC5",
          },
        ]}
        onPress={handleSignUp}
        disabled={mentorshipAreasArray.length === 0}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MenteeAreas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#534E5B",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Platform.select({
      web: 20,
      default: 20,
    }),
    paddingBottom: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    minHeight: Platform.select({
      web: 'auto',
      default: Dimensions.get('window').height * 0.8,
    }),
  },
  title: {
    fontSize: Platform.select({
      web: 26,
      default: 22,
    }),
    fontWeight: "700",
    marginBottom: 10,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: Platform.select({
      web: 0,
      default: 40,
    }),
  },
  subtitle: {
    fontSize: Platform.select({
      web: 16,
      default: 14,
    }),
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    marginVertical: 20,
    maxHeight: Platform.select({
      web: 'auto',
      default: Dimensions.get('window').height * 0.6,
    }),
  },
  chipContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: Platform.select({
      web: 15,
      default: 10,
    }),
    borderRadius: 20,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: "#92C7C5",
  },
  unselectedChip: {
    backgroundColor: "#E8EAF6",
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  unselectedChipText: {
    color: "#534E5B",
  },
  signupButton: {
    padding: 15,
    borderRadius: 40,
    width: "100%",
    alignItems: "center",
    marginTop: Platform.select({
      web: 20,
      default: 20,
    }),
    marginBottom: Platform.select({
      web: 0,
      default: 20,
    }),
  },
  buttonText: {
    color: "#534E5B",
    fontSize: Platform.select({
      web: 18,
      default: 16,
    }),
    fontWeight: "600",
  },
  chipText: {
    color: "#534E5B",
    fontSize: Platform.select({
      web: 18,
      default: 14,
    }),
    fontWeight: "600",
    textAlign: 'center',
  },
});