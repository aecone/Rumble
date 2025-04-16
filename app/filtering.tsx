import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define filter interface
interface FilterOptions {
  major?: string;
  gradYear?: string;
  //ethnicity?: string;
  //gender?: string;
  interestedIndustries?: string[];
  mentorshipAreas?: string[];
  orgs?: string[];
  hobbies?: string[];
  careerPath?: string;  // Changed from string[] to string
  userType?: string;
  [key: string]: any; // For any additional properties
}

const filtering = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse current filters from route params
  let currentFilters: FilterOptions = {};
  try {
    if (params.currentFilters && typeof params.currentFilters === 'string') {
      currentFilters = JSON.parse(params.currentFilters);
    }
  } catch (e) {
    console.error("Error parsing filters:", e);
  }
  
  // Initialize filter state with current filters or defaults
  const [filters, setFilters] = useState<FilterOptions>({
    major: currentFilters?.major || '',
    gradYear: currentFilters?.gradYear || '',
    //ethnicity: currentFilters?.ethnicity || '',
    //gender: currentFilters?.gender || '',
    interestedIndustries: currentFilters?.interestedIndustries || [],
    mentorshipAreas: currentFilters?.mentorshipAreas || [],
    orgs: currentFilters?.orgs || [],
    hobbies: currentFilters?.hobbies || [],
    careerPath: currentFilters?.careerPath || '',  // Changed from array to string
    userType: currentFilters?.userType || ''
  });

  const gradYears = [
    '', '2025', '2026', '2027', '2028', '2029'
  ];
  
  const majors = [
    '', 'Computer Science', 'Business', 'Engineering', 'Psychology', 
    'Biology', 'Economics', 'Political Science', 'Mathematics', 'English',
    'Mechanical Engineering', 'Electrical Engineering', 'Business Administration', 'BAIT',
    'Information Technology', 'Biomedical Engineering', 'Communications', 'Civil Engineering', 
    'Engineering (other)', 'Psychology', 'Public Health', 'Biology', 'English', 'History',
    'Political Science', 'Arts', 'Other'
  ];

  const ethnicities = [
    '', 'Asian', 'East Asian', 'Southeast Asian', 'South Asian', 'Middle Eastern, Arab', 'American Indian/Alaskan Native', 
    'Black', 'Hispanic/Latino', 'White', 'Native American', 'Native Hawaiian or Pacific Islander', 
    'Multiracial'
  ];

  const genders = ['', 'Male', 'Female', 'Non-binary', 'Genderfluid,', 'Other'];

  // Sample industries - adjust as needed
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Entertainment',
    'Consulting', 'Marketing', 'Engineering', 'Research', 'Non-profit',
    'Manufacturing', 'Real Estate', 'Transportation', 'Energy', 'Agriculture',
    'Media', "Telecommunications", "Hospitality", "Automotive",
    "Aerospace", "Pharmaceuticals", "Consulting", "Non-Profit", "Government", 
  ];

  // Sample mentorship areas - adjust as needed
  const mentorshipAreas = [
    "Career Advice", "Resume Review", "Interview Prep", "Networking", "Leadership",
    "Technical Skills", "Project Management", "Public Speaking", "Time Management", "Course Advisement",
    "Personal Branding", "Work-Life Balance", "Teamwork",
    "Career Transition", "Job Search", "Professional Development", "Industry Insights", "Skill Building",
  ];

  // Sample organizations - adjust as needed
  const organizations = [
    'WiCS', 'USACS', 'RUFP', 'RUMAD',
  ];

  // Sample organizations - adjust as needed
  const hobbies = [
    'Reading', 'Gaming', 'Hiking', 'Cooking', 'Music',
    'Photography', 'Dancing', 'Traveling', 'Tennis', 'Coding',
    'Movies', 'Painting', 'Football', 'Soccer', 'Pickleball',
    'Writing', 'Basketball', 'F1', 'TV',
  ];

  const careerPath = [
    '', 'UI/UX', 'Medicine', 'Politics', 'Law', 'Design', 'Research', 
    'Finance', 'Data Science', 'Data Engineering', 'Software Engineering',
    'Computer Engineering', 'Biomedical Engineering', 'Electrical Engineering',
    'Marketing'
  ];

  const userTypes = [
    "mentor", "mentee"
  ];


  const handleMultiSelect = (category: string, item: string) => {
    setFilters(prev => {
      const currentItems = prev[category] || [];
      if (Array.isArray(currentItems)) {
        if (currentItems.includes(item)) {
          return { ...prev, [category]: currentItems.filter(i => i !== item) };
        } else {
          return { ...prev, [category]: [...currentItems, item] };
        }
      }
      return prev;
    });
  };

  const handleApplyFilters = async () => {
    // Only include non-empty filters
    const cleanedFilters = Object.entries(filters).reduce((acc: FilterOptions, [key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        acc[key] = value;
      } else if (value !== '' && !Array.isArray(value)) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    // Save filters to AsyncStorage
    try {
      await AsyncStorage.setItem('userFilters', JSON.stringify(cleanedFilters));
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error("Failed to save filters:", error);
      console.error("Error", "Failed to save filters");
    }
  };

  const handleResetFilters = () => {
    setFilters({
      major: '',
      gradYear: '',
      //ethnicity: '',
      //gender: '',
      interestedIndustries: [],
      mentorshipAreas: [],
      orgs: [],
      hobbies: [],
      careerPath: '',  // Changed from array to empty string
      userType: ''
    });
  };

  const renderMultiSelect = (title: string, items: string[], category: string) => {
    return (
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.multiSelectContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.multiSelectItem,
                filters[category]?.includes(item) && styles.multiSelectItemSelected
              ]}
              onPress={() => handleMultiSelect(category, item)}
            >
              <Text style={[
                styles.multiSelectText,
                filters[category]?.includes(item) && styles.multiSelectTextSelected
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Filter Users</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Single Graduation Year */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Graduation Year</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.gradYear}
              onValueChange={(itemValue) => setFilters({...filters, gradYear: itemValue})}
              style={styles.picker}
            >
              {gradYears.map((year, index) => (
                <Picker.Item key={index} label={year || "Any Year"} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Major */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Major</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.major}
              onValueChange={(itemValue) => setFilters({...filters, major: itemValue})}
              style={styles.picker}
            >
              {majors.map((major, index) => (
                <Picker.Item key={index} label={major || "Any Major"} value={major} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Career Path - Changed from multi-select to dropdown */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Career Path</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.careerPath}
              onValueChange={(itemValue) => setFilters({...filters, careerPath: itemValue})}
              style={styles.picker}
            >
              {careerPath.map((path, index) => (
                <Picker.Item key={index} label={path || "Any Career Path"} value={path} />
              ))}
            </Picker>
          </View>
        </View>


        {/* Industries */}
        {renderMultiSelect('Interested Industries', industries, 'interestedIndustries')}

        {/* Mentorship Areas */}
        {renderMultiSelect('Mentorship Areas', mentorshipAreas, 'mentorshipAreas')}

        {/* Organizations */}
        {renderMultiSelect('Organizations', organizations, 'orgs')}

        {/* Hobbies */}
        {renderMultiSelect('Hobbies', hobbies, 'hobbies')}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleResetFilters}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.applyButton} 
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 20,
    backgroundColor: '#534E5B',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 45,
    padding: 10,
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 45,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    borderBlockColor: '#FFF',
    borderColor:'#FFF'
  },
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multiSelectItem: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#FFF',
  },
  multiSelectItemSelected: {
    backgroundColor: '#534E5B',
    borderColor: '#534E5B',
  },
  multiSelectText: {
    color: '#333',
  },
  multiSelectTextSelected: {
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#534E5B',
    backgroundColor: '#FFF',
  },
  resetButtonText: {
    color: '#534E5B',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#534E5B',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default filtering;