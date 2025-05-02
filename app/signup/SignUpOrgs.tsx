/*
User input for organizations in signup sequence.
Navigates to MentorOrMentee
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
import React from "react";
import { router } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { normalizeToArray, toggleValueInArray } from "../utils/signupHelpers";
import { signupStepPaths} from "../utils/routes";
import { useSignupNavigation } from "../hooks/useSignupNavigation";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
const predefinedOrgs = [
  "Women in Product",
  "USACS",
  "WiCS",
  "RUMAD",
  "Hack4Impact",
  "Out In Tech",
  "Women in ITI",
  "Blueprint",
  "RUPA",
  "Creative X",
  "Ethitech",
  "3D Club",
  "RUFP",
  "Culture Clubs",
  "Sports Clubs",
  "RAD",
  "WRSU",
  "COGS",
];

// Obj/function for formatting and valid input chip group
const SignUpOrgs = () => {
  const { orgs, setField } = useSignupStore();
  const orgsArray = normalizeToArray(orgs);

  const toggleOrg = (org: string) => {
    const updatedOrgs = toggleValueInArray(orgsArray, org);
    setField("orgs", updatedOrgs);
  };

  const proceed = () => {
    router.push(signupStepPaths.MentorOrMentee);
  };

  const isFormValid = orgsArray.length > 0;

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>What organizations are you a part of?</Text>

          <View style={styles.listContainer}>
            <FlatList
              data={predefinedOrgs}
              numColumns={3}
              keyExtractor={(item: string) => item}
              renderItem={({ item }: { item: string }) => (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    orgsArray.includes(item)
                      ? styles.selectedChip
                      : styles.unselectedChip,
                  ]}
                  onPress={() => toggleOrg(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      orgsArray.includes(item)
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

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isFormValid ? "#FFFFFF" : "#B0BEC5" },
            ]}
            onPress={proceed}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUpOrgs;

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
    marginBottom: Platform.select({
      web: 0,
      default: 30,
    }),
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
      web: 15,
      default: 10, // Smaller padding for organization names
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
      default: 14, // Smaller font for organization names
    }),
    fontWeight: "600",
    textAlign: 'center',
  },
});