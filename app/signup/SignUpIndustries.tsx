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
  "Marketing",
  "Government",
  "Consulting",
  "Law",
  "Engineering",
  "Retail",
];

const { height } = Dimensions.get('window');

const SignUpIndustries = () => {
  const { interestedIndustries, setField } = useSignupStore();
  const industriesArray = normalizeToArray(interestedIndustries);
const { onNext } = useSignupNavigation();

  const toggleIndustry = (industry: string) => {
    const updatedIndustries = toggleValueInArray(industriesArray, industry);
    setField("interestedIndustries", updatedIndustries);
  };


  const isFormValid = industriesArray.length > 0;

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>What industries are you interested in?</Text>

          <View style={styles.listContainer}>
            <FlatList
              data={predefinedIndustries}
              numColumns={3}
              keyExtractor={(item: string) => item}
              renderItem={({ item }: { item: string }) => (
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
              scrollEnabled={false}
            />
          </View>

      <NextButton next={signupStepPaths.SignUpOrgs} disabled={!isFormValid} />

      </View>
      </ScrollView>
    </View>
  );
};

export default SignUpIndustries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#534E5B",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingBottom: 30,
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
      web: -5,
      default: 30,
    }),
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: Platform.select({
      web: 0,
      default: 40,
    }),
    paddingHorizontal: 20
  },
  chipContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: Platform.select({
      web: 15,
      default: 12, // Slightly smaller padding for longer industry names
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
      web: -10,
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
      default: 14, // Smaller font for longer industry names
    }),
    fontWeight: "600",
    textAlign: 'center',
  },
});