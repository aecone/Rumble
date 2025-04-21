import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "./utils/useSignupStore";

const SignUpGradYear = () => {
  const { gradYear, setField } = useSignupStore();

  const [open, setOpen] = useState(false);

  const yearItems = [
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" },
    { label: "Other", value: "Other" },
  ];

  const proceed = () => {
    router.push("/SignUpEthnicity");
  };

  const isFormValid = gradYear !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your anticipated graduation year?</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerWrapper}>
        <DropDownPicker
          open={open}
          value={gradYear}
          items={yearItems}
          setOpen={setOpen}
          setValue={(callback) => {
            const selectedYear =
              typeof callback === "function" ? callback(gradYear) : callback;
            setField("gradYear", selectedYear);
          }}
          placeholder="Select Graduation Year"
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

export default SignUpGradYear;

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
