import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { normalizeToArray, toggleValueInArray } from "../utils/signupHelpers";

const predefinedHobbies = [
  "Reading",
  "Gaming",
  "Hiking",
  "Cooking",
  "Music",
  "Photography",
  "Dancing",
  "Traveling",
  "Tennis",
  "Coding",
  "Movies",
  "Painting",
  "Football",
  "Soccer",
  "Pickleball",
  "Writing",
  "Basketball",
  "F1",
  "TV",
];

const SignUpHobbies = () => {
  const { hobbies, setField } = useSignupStore();
  const hobbiesArray = normalizeToArray(hobbies);

  const toggleHobby = (hobby: string) => {
    setField("hobbies", (prevHobbies: string[]) =>
      toggleValueInArray(prevHobbies, hobby)
    );
  };

  const proceed = () => {
    router.push("/signup/SignUpCareer");
  };

  const isFormValid = hobbiesArray.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Select your hobbies and interests</Text>

        <View style={styles.listContainer}>
          <FlatList
            data={predefinedHobbies}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  hobbiesArray.includes(item)
                    ? styles.selectedChip
                    : styles.unselectedChip,
                ]}
                onPress={() => toggleHobby(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    hobbiesArray.includes(item)
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
            styles.button,
            { backgroundColor: isFormValid ? "#FFFFFF" : "#B0BEC5" },
          ]}
          onPress={proceed}
          disabled={!isFormValid}
        >
          <Text style={styles.text}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpHobbies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#534E5B",
    paddingHorizontal: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    color: "#FFFFFF",
    textAlign: "center",
  },
  chipContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: "#92C7C5", // Orange when selected
  },
  unselectedChip: {
    backgroundColor: "#E8EAF6", // Light gray when unselected
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  unselectedChipText: {
    color: "#534E5B",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  text: {
    color: "#534E5B",
    fontSize: 20,
    fontWeight: "600",
  },
  chipText: {
    color: "#534E5B",
    fontSize: 18,
    fontWeight: "600",
  },
});
