import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    FlatList,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

const predefinedMentorshipAreas = [
    "Career Advice", "Resume Review", "Interview Prep", "Networking", "Leadership",
    "Technical Skills", "Project Management", "Public Speaking", "Time Management", "Course Advisement",
    "Personal Branding", "Work-Life Balance", "Teamwork",
    "Career Transition", "Job Search", "Professional Development", "Industry Insights", "Skill Building",
];

const MenteeAreas = () => {
    // Retrieve user data passed from the previous screen
    const { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies, career, industries, orgs } =
        useLocalSearchParams();

    const [selectedMentorshipAreas, setSelectedMentorshipAreas] = useState<string[]>([]);

    const toggleMentorshipArea = (area: string) => {
        setSelectedMentorshipAreas(prevAreas =>
            prevAreas.includes(area)
                ? prevAreas.filter(a => a !== area)  // Remove if selected
                : [...prevAreas, area]  // Add if not selected
        );
    };

    const handleSignUp = async () => {
        if (selectedMentorshipAreas.length === 0) {
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
            const hobbiesArray = Array.isArray(hobbies) ? hobbies : hobbies ? String(hobbies).split(",").map(hobby => hobby.trim()) : [];
            const industriesArray = Array.isArray(industries) ? industries : industries ? String(industries).split(",").map(industry => industry.trim()) : [];
            const orgsArray = Array.isArray(orgs) ? orgs : orgs ? String(orgs).split(",").map(org => org.trim()) : [];

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
                careerPath: Array.isArray(career) ? career[0] : career || "",
                interestedIndustries: industriesArray,
                userType: "mentee",
                mentorshipAreas: selectedMentorshipAreas,
            };

            // Log the data being sent
            console.log("Sending data to server:", JSON.stringify(userData, null, 2));

            // Make the API call
            const response = await fetch("http://127.0.0.1:5000/api/create_user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            // Log the full response
            console.log("Response status:", response.status);
            console.log("Response headers:", JSON.stringify([...response.headers.entries()]));
            
            const responseText = await response.text();
            console.log("Response body:", responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log("Parsed response data:", data);
            } catch (e) {
                console.error("Failed to parse response as JSON:", responseText);
                data = { error: "Invalid server response" };
            }

            if (response.ok) {
                Alert.alert("Success", "Account created successfully!");
                router.push("/");
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
            <Text style={styles.title}>What areas would you like mentorship in?</Text>
            <Text style={styles.subtitle}>
                Please select your areas of mentorship
            </Text>

            <View style={styles.listContainer}>
                <FlatList
                    data={predefinedMentorshipAreas}
                    numColumns={3}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                selectedMentorshipAreas.includes(item) ? styles.selectedChip : styles.unselectedChip
                            ]}
                            onPress={() => toggleMentorshipArea(item)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    selectedMentorshipAreas.includes(item) ? styles.selectedChipText : styles.unselectedChipText
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
                style={[styles.signupButton, { backgroundColor: selectedMentorshipAreas.length > 0 ? '#FFFFFF' : '#B0BEC5' }]}
                onPress={handleSignUp}
                disabled={selectedMentorshipAreas.length === 0}
            >
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MenteeAreas;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#534E5B",
        padding: 80,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 10,
        color: "#FFFFFF",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
    },
    listContainer: {
        marginVertical: 20,
    },
    chipContainer: {
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: '#92C7C5', // Teal when selected
    },
    unselectedChip: {
        backgroundColor: '#E8EAF6', // Light gray when unselected
    },
    selectedChipText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    unselectedChipText: {
        color: '#534E5B',
    },
    signupButton: {
        padding: 15,
        borderRadius: 40,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#534E5B",
        fontSize: 18,
        fontWeight: "600",
    },
    chipText: {
        color: '#534E5B',
        fontSize: 18,
        fontWeight: '600',
    }
});