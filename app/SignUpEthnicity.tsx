import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "./utils/useSignupStore";

const SignUpEthnicity = () => {
  const { ethnicity, setField } = useSignupStore();

  const [open, setOpen] = useState(false);

  const ethnicityItems = [
    { label: "Asian", value: "Asian" },
    { label: "East Asian", value: "East Asian" },
    { label: "South Asian", value: "South Asian" },
    { label: "Southeast Asian", value: "Southeast Asian" },
    { label: "Middle Eastern/Arab", value: "Middle Eastern/Arab" },
    {
      label: "American Indian/Alaskan Native",
      value: "American Indian/Alaskan Native",
    },
    { label: "African American", value: "African American" },
    {
      label: "Native Hawaiian or Pacific Islander",
      value: "Native Hawaiian or Pacific Islander",
    },
    { label: "Hispanic or Latino", value: "Hispanic or Latino" },
    { label: "White", value: "White" },
    { label: "Multiracial", value: "Multiracial" },
    { label: "Prefer not to say", value: "Prefer not to say" },
    { label: "Other", value: "Other" },
  ];

  const proceed = () => {
    router.push("/SignUpGenderPronouns");
  };

  const isFormValid = ethnicity !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please select your race/ethnicity</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerWrapper}>
        <DropDownPicker
          open={open}
          value={ethnicity}
          items={ethnicityItems}
          setOpen={setOpen}
          setValue={(callback) => {
            const selectedEthnicity =
              typeof callback === "function" ? callback(ethnicity) : callback;
            setField("ethnicity", selectedEthnicity);
          }}
          placeholder="Select Race/Ethnicity"
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
  );
};

export default SignUpEthnicity;

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
