import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const predefinedIndustries = [
  "Technology", "Healthcare", "Finance", "Education",
  "Manufacturing", "Energy",
  "Agriculture", "Telecom", "Media", "Hospitality", 
  "Aerospace", "Pharmaceuticals", "Consulting", "Non-Profit", "Government", 
  "Marketing", "Consulting", "Engineering", "Law", "Other"
];

const SignUpIndustries = () => {
  const { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies, career } = useLocalSearchParams();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevIndustries =>
      prevIndustries.includes(industry)
        ? prevIndustries.filter(i => i !== industry)  // Remove if selected
        : [...prevIndustries, industry]  // Add if not selected
    );
  };

  const proceed = () => {
    router.push({
      pathname: '/SignUpOrgs',
      params: { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies, career, industries: selectedIndustries.join(', ') }
    });
  };

  const isFormValid = selectedIndustries.length > 0;

  return (
    <View style={styles.container}>
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
                  selectedIndustries.includes(item) ? styles.selectedChip : styles.unselectedChip
                ]}
                onPress={() => toggleIndustry(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedIndustries.includes(item) ? styles.selectedChipText : styles.unselectedChipText
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
          style={[styles.button, { backgroundColor: isFormValid ? '#FFFFFF' : '#B0BEC5' }]}
          onPress={proceed}
          disabled={!isFormValid}
        >
          <Text style={styles.text}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpIndustries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#534E5B',
    paddingHorizontal: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: -5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
    backgroundColor: '#92C7C5', // Teal when selected
  },
  unselectedChip: {
    backgroundColor: '#E8EAF6', // Light gray when unselected
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  unselectedChipText: {
    color: '#534E5B',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: -10,
  },
  text: {
    color: '#534E5B',
    fontSize: 18,
    fontWeight: '600',
  },
  chipText: {
    color: '#534E5B',
    fontSize: 18,
    fontWeight: '600',
  },
});