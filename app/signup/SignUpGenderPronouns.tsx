/*
User input for gender and pronouns in signup sequence.
Navigates to SignUpHobbies
*/

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { signupStepPaths} from "../utils/routes";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";
import { useSignupNavigation } from "../hooks/useSignupNavigation";

// Obj function for formatting and valid input drop down
const SignUpGenderPronouns = () => {
  const { gender, pronouns, setField } = useSignupStore();

  const [genderOpen, setGenderOpen] = useState(false);
  const [pronounsOpen, setPronounsOpen] = useState(false);
  
  const genderItems = [
    { label: "Woman", value: "Woman" },
    { label: "Man", value: "Man" },
    { label: "Non-binary", value: "Non-binary" },
    { label: "Genderfluid", value: "Genderfluid" },
    { label: "Prefer not to say", value: "Prefer not to say" },
    { label: "Other", value: "Other" },
  ];

  const pronounsItems = [
    { label: "He/Him", value: "He/Him" },
    { label: "She/Her", value: "She/Her" },
    { label: "They/Them", value: "They/Them" },
    { label: "He/They", value: "He/They" },
    { label: "She/They", value: "She/They" },
    { label: "Ze/Hir", value: "Ze/Hir" },
    { label: "Ze/Zir", value: "Ze/Zir" },
    { label: "Xe/Xem", value: "Xe/Xem" },
    { label: "Prefer not to say", value: "Prefer not to say" },
    { label: "Other", value: "Other" },
  ];



  // Check if both fields are filled
  const isFormValid = gender !== "" && pronouns !== "";

  return (
    <View style={styles.container}>
        <BackButton />
      <Text style={styles.title}>Please select your gender & pronouns</Text>

      {/* Gender Dropdown */}
      <View style={[styles.pickerWrapper, { zIndex: 3 }]}>
        <DropDownPicker
          open={genderOpen}
          value={gender}
          items={genderItems}
          setOpen={setGenderOpen}
          setValue={(callback) => {
            const selectedGender =
              typeof callback === "function" ? callback(gender) : callback;
            setField("gender", selectedGender);
          }}
          placeholder="Select Gender"
          style={styles.dropdownStyle}
          textStyle={styles.dropdownTextStyle}
          dropDownContainerStyle={styles.dropDownContainerStyle}
          placeholderStyle={styles.placeholderStyle}
          listItemContainerStyle={styles.listItemContainerStyle}
          selectedItemContainerStyle={styles.selectedItemContainerStyle}
          selectedItemLabelStyle={styles.selectedItemLabelStyle}
          maxHeight={300}
          autoScroll={true}
          showTickIcon={true}
          onOpen={() => setPronounsOpen(false)}
          tickIconStyle={{
            width: 15,
            height: 15,
            backgroundColor: "#92C7C5",
            borderRadius: 50,
          }}
          arrowIconStyle={{
            backgroundColor: "#92C7C5",
            borderRadius: 50,
          }}
        />
      </View>

      {/* Pronouns Dropdown */}
      <View style={[styles.pickerWrapper, { zIndex: 2 }]}>
        <DropDownPicker
          open={pronounsOpen}
          value={pronouns}
          items={pronounsItems}
          setOpen={setPronounsOpen}
          setValue={(callback) => {
            const selectedPronouns =
              typeof callback === "function" ? callback(pronouns) : callback;
            setField("pronouns", selectedPronouns);
          }}
          placeholder="Select Pronouns"
          style={styles.dropdownStyle}
          textStyle={styles.dropdownTextStyle}
          dropDownContainerStyle={styles.dropDownContainerStyle}
          placeholderStyle={styles.placeholderStyle}
          listItemContainerStyle={styles.listItemContainerStyle}
          selectedItemContainerStyle={styles.selectedItemContainerStyle}
          selectedItemLabelStyle={styles.selectedItemLabelStyle}
          maxHeight={300}
          autoScroll={true}
          showTickIcon={true}
          onOpen={() => setGenderOpen(false)}
          tickIconStyle={{
            width: 15,
            height: 15,
            backgroundColor: "#92C7C5",
            borderRadius: 50,
          }}
          arrowIconStyle={{
            backgroundColor: "#92C7C5",
            borderRadius: 50,
          }}
        />
      </View>
      <NextButton next={signupStepPaths.SignUpHobbies} disabled={!isFormValid} />
    </View>
  );
};

export default SignUpGenderPronouns;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#534E5B",
    paddingHorizontal: 20,
    zIndex: 1, // Important for the dropdown to show properly
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    color: "#FFFFFF",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  pickerWrapper: {
    width: "90%",
    maxWidth: 350,
    marginVertical: 10,
  },
  dropdownStyle: {
    backgroundColor: "#534E5B",
    borderColor: "#E8EAF6",
    borderWidth: 1,
    borderRadius: 40,
    height: 50,
  },
  dropdownTextStyle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "400",
  },
  dropDownContainerStyle: {
    backgroundColor: "#534E5B",
    borderColor: "#E8EAF6",
    borderWidth: 1,
    maxHeight: 300,
  },
  placeholderStyle: {
    color: "#FFFFFF",
    opacity: 0.7,
    fontSize: 18,
  },
  listItemContainerStyle: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  selectedItemContainerStyle: {
    backgroundColor: "rgba(146, 199, 197, 0.2)", // Light teal background for selected item
  },
  selectedItemLabelStyle: {
    color: "#92C7C5", // Teal text for selected item
    fontWeight: "bold",
  },
  button: {
    width: "90%",
    maxWidth: 350,
    marginVertical: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    zIndex: 0, // Ensure button stays below dropdown
  },
  text: {
    color: "#534E5B",
    fontSize: 20,
    fontWeight: "500",
  },
});
