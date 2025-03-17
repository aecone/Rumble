import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

const MentorOrMentee = () => {
    const { firstName, lastName, email, password, birthday, major, ethnicity, gender, prounouns } =
        useLocalSearchParams();
    
    const [role, setRole] = useState(""); 

    const signUp = async () => {
        if (!role) {
            alert("Please select Mentor or Mentee before signing up.");
            return;
        }

        try {
            const emailString = Array.isArray(email) ? email[0] : email;
            const passwordString = Array.isArray(password) ? password[0] : password;

            if (!emailString || !passwordString) {
                alert("Invalid email or password.");
                return;
            }
            const API_BASE_URL = "https://rumble-xe2g.onrender.com/api"; 
            const response = await fetch(`${API_BASE_URL}/create_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailString,
                    password: passwordString,
                    firstName,
                    lastName,
                    birthday,
                    major,
                    ethnicity,
                    gender,
                    prounouns,
                    role, // Include selected role
                }),
            });

            const data = await response.json();
            if (response.ok) {
                router.replace("/"); 
            } else {
                alert("Sign up failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.log(error);
            alert("Sign up failed: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Would you like to be a mentor or a mentee?</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        role === "mentor" ? styles.selectedButton : styles.unselectedButton,
                    ]}
                    onPress={() => setRole("mentor")}
                >
                    <Text style={styles.text}>Mentor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        role === "mentee" ? styles.selectedButton : styles.unselectedButton,
                    ]}
                    onPress={() => setRole("mentee")}
                >
                    <Text style={styles.text}>Mentee</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.signupButton, role ? styles.activeButton : styles.disabledButton]}
                onPress={signUp}
                disabled={!role} 
            >
                <Text style={styles.text}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MentorOrMentee;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 30,
        color: "#1A237E",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    text: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    selectedButton: {
        backgroundColor: "#2E7D32", 
    },
    unselectedButton: {
        backgroundColor: "#5C6BC0", 
    },
    signupButton: {
        marginTop: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        width: "90%",
    },
    activeButton: {
        backgroundColor: "#1A237E", 
    },
    disabledButton: {
        backgroundColor: "#BDBDBD",
    },
});
