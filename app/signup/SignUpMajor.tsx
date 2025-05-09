/*
User input for major in signup sequence.
Navigates to SignUpGradYear
*/

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { signupStepPaths} from "../utils/routes";
import { useSignupNavigation } from "../hooks/useSignupNavigation";
import { BackButton } from "../components/BackButton";
import { NextButton } from "../components/NextButton";

// Obj/function for formatting and valid input drop down
const SignUpMajor = () => {
  const { major, setField } = useSignupStore();
  const [open, setOpen] = useState(false);
  const majorItems = [
    { label: "Computer Science", value: "Computer Science" },
    { label: "Mechanical Engineering", value: "Mechanical Engineering" },
    { label: "Electrical Engineering", value: "Electrical Engineering" },
    { label: "Business Administration", value: "Business Administration" },
    { label: "BAIT", value: "BAIT" },
    { label: "Information Technology", value: "Information Technology" },
    { label: "Biomedical Engineering", value: "Biomedical Engineering" },
    { label: "Communications", value: "Communications" },
    { label: "Civil Engineering", value: "Civil Engineering" },
    { label: "Engineering (other)", value: "Engineering (other)" },
    { label: "Psychology", value: "Psychology" },
    { label: "Public Health", value: "Public Health" },
    { label: "Biology", value: "Biology" },
    { label: "English", value: "English" },
    { label: "History", value: "History" },
    { label: "Political Science", value: "Political Science" },
    { label: "Arts", value: "Arts" },
    { label: "Other", value: "Other" },
  ];

  const isFormValid = major !== "";

  return (
    <View style={styles.container}>
        <BackButton />
      <Text style={styles.title}>What's your major?</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerWrapper}>
        <DropDownPicker
          open={open}
          value={major}
          items={majorItems}
          setOpen={setOpen}
          setValue={(callback) => {
            const selectedMajor =
              typeof callback === "function" ? callback(major) : callback;
            setField("major", selectedMajor);
          }}
          placeholder="Select Major"
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
      <NextButton next={signupStepPaths.SignUpGradYear} disabled={!isFormValid} />
    </View>
  );
};

export default SignUpMajor;

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
    zIndex: 2, // Important for the dropdown to show above other elements
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
