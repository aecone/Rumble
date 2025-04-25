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
import { signupStepPaths} from "../utils/routes";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
import { useSignupNavigation } from "../hooks/useSignupNavigation";

const predefinedIndustries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Energy",
  "Agriculture",
  "Telecommunications",
  "Media",
  "Hospitality",
  "Aerospace",
  "Biotechnology",
  "Pharmaceuticals",
  "Non-Profit",
  "Government",
  "Marketing",
  "Consulting",
  "Engineering",
  "Law",
  "Retail",
];

const SignUpIndustries = () => {
  const { interestedIndustries, setField } = useSignupStore();
  const industriesArray = normalizeToArray(interestedIndustries);
const { onNext } = useSignupNavigation();

  const toggleIndustry = (industry: string) => {
    const updatedIndustries = toggleValueInArray(normalizeToArray(interestedIndustries), industry);
    setField("interestedIndustries", updatedIndustries);
  };


  const isFormValid = industriesArray.length > 0;

  return (
    <View style={styles.container}>
              <BackButton />
      
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>What industries are you interested in?</Text>

        <View style={styles.listContainer}>
          <FlatList
            data={predefinedIndustries}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  industriesArray.includes(item)
                    ? styles.selectedChip
                    : styles.unselectedChip,
                ]}
                onPress={() => toggleIndustry(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    industriesArray.includes(item)
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

      <NextButton next={signupStepPaths.SignUpOrgs} disabled={!isFormValid} />

      </View>
    </View>
  );
};

export default SignUpIndustries;

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
    marginBottom: -5,
    color: "#FFFFFF",
    textAlign: "center",
  },
  chipContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: "#92C7C5", // Teal when selected
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
    marginTop: -10,
  },
  text: {
    color: "#534E5B",
    fontSize: 18,
    fontWeight: "600",
  },
  chipText: {
    color: "#534E5B",
    fontSize: 18,
    fontWeight: "600",
  },
});
