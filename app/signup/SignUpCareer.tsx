import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSignupStore } from "../utils/useSignupStore";
import { Routes } from "../utils/routes";

const SignUpCareer = () => {
  const { careerPath, setField } = useSignupStore();

  const [open, setOpen] = useState(false);

  const careerItems = [
    { label: "UI/UX", value: "UI/UX" },
    { label: "Medicine", value: "Medicine" },
    { label: "Politician", value: "Politician" },
    { label: "Law", value: "Law" },
    { label: "Design", value: "Design" },
    { label: "Research", value: "Research" },
    { label: "Finance", value: "Finance" },
    { label: "Data Science", value: "Data Science" },
    { label: "Data Engineering", value: "Data Engineering" },
    { label: "Software Engineering", value: "Software Engineering" },
    { label: "Computer Engineering", value: "Computer Engineering" },
    { label: "Biomedical Engineering", value: "Biomedical Engineering" },
    { label: "Electrical Engineering", value: "Electrical Engineering" },
    { label: "Marketing", value: "Marketing" },
    { label: "Other", value: "Other" },
  ];

  const proceed = () => {
    router.push(Routes.SignUpIndustries);
  };

  const isFormValid = careerPath !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your intended career</Text>

      {/* DropDown Picker */}
      <View style={styles.pickerWrapper}>
        <DropDownPicker
          open={open}
          value={careerPath}
          items={careerItems}
          setOpen={setOpen}
          setValue={(callback) => {
            const selectedCareer =
              typeof callback === "function" ? callback(careerPath) : callback;
            setField("careerPath", selectedCareer); // Notice: match your Firebase field name "careerPath"
          }}
          placeholder="Select career"
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

export default SignUpCareer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#534E5B",
    paddingHorizontal: 20,
    zIndex: 1,
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
    zIndex: 2,
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
    backgroundColor: "rgba(146, 199, 197, 0.2)",
  },
  selectedItemLabelStyle: {
    color: "#92C7C5",
    fontWeight: "bold",
  },
  button: {
    width: "90%",
    maxWidth: 350,
    marginVertical: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    zIndex: 0,
  },
  text: {
    color: "#534E5B",
    fontSize: 20,
    fontWeight: "500",
  },
});
