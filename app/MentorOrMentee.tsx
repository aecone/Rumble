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

            const response = await fetch("http://127.0.0.1:5000/api/create_user", {
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
                <Text style={[
                    styles.text, 
                    role === "mentor" ? styles.selectedText : styles.unselectedText
                ]}>
                    Mentor
                </Text>
            </TouchableOpacity>

            </View>

            <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[
                    styles.button,
                    role === "mentee" ? styles.selectedButton : styles.unselectedButton,
                ]}
                onPress={() => setRole("mentee")}
            >
                <Text style={[
                    styles.text, 
                    role === "mentee" ? styles.selectedText : styles.unselectedText
                ]}>
                    Mentee
                </Text>
            </TouchableOpacity>

            </View>

            <TouchableOpacity
                style={[styles.signupButton, role ? styles.activeButton : styles.disabledButton]}
                onPress={signUp}
                disabled={!role} 
            >
                <Text style={styles.selectedText}>Sign Up</Text>
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
        backgroundColor: "#534E5B",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 30,
        color: "#FFFFFF",
        alignItems: "center"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        borderColor: "#FFFFFF"
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 10,
        padding: 15,
        borderWidth: 1,
        borderRadius: 40,
        borderColor: "#FFFFFF",
        alignItems: "flex-start",
    },
    text: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    selectedButton: {
        backgroundColor: "#FFFFFF", 
        color: '#534E5B',
        borderColor: "#FFFFFF"
    },
    selectedText: {
        color: '#534E5B',
        fontSize: 20
    },
    unselectedButton: {
        backgroundColor: "#534E5B", 
        color: '#534E5B'
    },
    unselectedText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "400"
    },
    signupButton: {
        marginTop: 20,
        padding: 15,
        borderRadius: 40,
        alignItems: "center",
        width: "90%",
    },
    activeButton: {
        backgroundColor: "#FFFFFF", 
    },
    disabledButton: {
        backgroundColor: "#BDBDBD",
    },
});
