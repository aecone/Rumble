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

const SignUpOrgs = () => {
  const { orgs, setField } = useSignupStore();
  const orgsArray = normalizeToArray(orgs);

  const toggleOrg = (org: string) => {
    const updatedOrgs = toggleValueInArray(normalizeToArray(orgs), org);
    setField("orgs", updatedOrgs);
  };
  

  const proceed = () => {
    router.push(signupStepPaths.MentorOrMentee);
  };

  const isFormValid = orgs.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>What organizations are you a part of?</Text>

        <View style={styles.listContainer}>
          <FlatList
            data={predefinedOrgs}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
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

export default SignUpOrgs;

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
    marginBottom: 0,
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
    fontSize: 18,
    fontWeight: "600",
  },
  chipText: {
    color: "#534E5B",
    fontSize: 18,
    fontWeight: "600",
  },
});
