/*
User input for hobbies in signup sequence.
Navigates to SignUpCareer
*/

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { normalizeToArray, toggleValueInArray } from "../utils/signupHelpers";
import { signupStepPaths} from "../utils/routes";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
import { useSignupNavigation } from "../hooks/useSignupNavigation";

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

const { height } = Dimensions.get('window');

// Obj/function for formatting and valid input chip group
const SignUpHobbies = () => {
  const { hobbies, setField } = useSignupStore();
  const hobbiesArray = normalizeToArray(hobbies);
  const { onNext } = useSignupNavigation();

  const toggleHobby = (hobby: string) => {
    const updatedHobbies = toggleValueInArray(hobbiesArray, hobby);
    setField("hobbies", updatedHobbies);
  };

  const isFormValid = hobbiesArray.length > 0;

  return (
    <View style={styles.container}>
      <BackButton/>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Select your hobbies and interests</Text>

          <View style={styles.listContainer}>
            <FlatList
              data={predefinedHobbies}
              numColumns={3}
              keyExtractor={(item: string) => item}
              renderItem={({ item }: { item: string }) => (
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
              scrollEnabled={false}
            />
          </View>

          <NextButton next={signupStepPaths.SignUpCareer} disabled={!isFormValid} />
        </View>
      </ScrollView> 
    </View>
  );
};


export default SignUpHobbies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#534E5B",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
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
  listContainer: {
    marginVertical: 20,
    maxHeight: Platform.select({
      web: 'auto',
      default: Dimensions.get('window').height * 0.6,
    }),
  },
  title: {
    fontSize: Platform.select({
      web: 26,
      default: 22,
    }),
    fontWeight: "700",
    marginBottom: 30,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: Platform.select({
      web: 0,
      default: 40,
    }),
  },
  chipContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: Platform.select({
      web: 20,
      default: 15,
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
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    marginBottom: Platform.select({
      web: 0,
      default: 20,
    }),
  },
  buttonText: {
    color: "#534E5B",
    fontSize: Platform.select({
      web: 20,
      default: 18,
    }),
    fontWeight: "600",
  },
  chipText: {
    color: "#534E5B",
    fontSize: Platform.select({
      web: 18,
      default: 16,
    }),
    fontWeight: "600",
  },
});