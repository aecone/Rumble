import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const predefinedOrgs = [
  "USACS", "RUMAD", "Women in Computer Science", "Women in ITI", "Women in Product",
  "Hack4Impact", "Out In Tech", 
];

const SignUpOrgs = () => {
  const { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies, career, industries} = useLocalSearchParams();
  const [orgs, setOrgs] = useState<string[]>([]);

  const toggleOrgs = (org: string) => {
    setOrgs(prevOrgs =>
      prevOrgs.includes(org)
        ? prevOrgs.filter(h => h !== org)  // Remove if selected
        : [...prevOrgs, org]  // Add if not selected
    );
  };

  const proceed = () => {
    // Navigate to the next page (Email/Password entry)
    router.push({
      pathname: '/MentorOrMentee',
      params: { firstName, lastName, email, password, birthday, major, gradYear, ethnicity, gender, pronouns, hobbies, career, industries, orgs }  // Pass name info to the next page
    });
  };

  const isFormValid = orgs.length > 0;
  
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>What organizations are you a part of?</Text>
    
          <View style={styles.listContainer}>
            <FlatList
              data={predefinedOrgs}
              numColumns={5}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    orgs.includes(item) ? styles.selectedChip : styles.unselectedChip
                  ]}
                  onPress={() => toggleOrgs(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      orgs.includes(item) ? styles.selectedChipText : styles.unselectedChipText
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

export default SignUpOrgs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#534E5B',
    paddingHorizontal: 100,
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
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 30,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 20,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
    backgroundColor: '#92C7C5', // Orange when selected
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
    marginTop: 20,
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
