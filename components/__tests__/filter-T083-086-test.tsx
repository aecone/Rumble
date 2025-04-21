import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
//import Filtering from '../../../app/filtering';
import * as FilteringModule from  '@/app/filtering';
const Filtering = FilteringModule.default;
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(() => ({
      back: jest.fn(),
      push: jest.fn(),
    })),
  }));
  
  jest.mock('@react-native-picker/picker', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    const MockPicker = ({ children, selectedValue, onValueChange }: any) => (
      <View testID="mock-picker">
        {React.Children.map(children, (child: any) => (
          <TouchableOpacity
            testID={`picker-item-${child.props.value}`}
            onPress={() => onValueChange(child.props.value)}
          >
            <Text>{child.props.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
    
    MockPicker.Item = ({ label, value }: any) => (
      <View testID={`picker-item-${value}`}>
        <Text>{label}</Text>
      </View>
    );
    
    return { Picker: MockPicker };
  });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

// Define interfaces outside the mock
interface MockPickerProps {
  children: React.ReactNode;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

interface MockPickerItemProps {
  label: string;
  value: string;
}

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockPicker = ({ children, selectedValue, onValueChange }: MockPickerProps) => (
    <View testID="mock-picker">
      {React.Children.map(children, (child: React.ReactElement<MockPickerItemProps>) => {
        if (child.props.value === selectedValue) {
          return (
            <View testID="selected-value">
              <Text>{child.props.label}</Text>
            </View>
          );
        }
        return (
          <View 
            testID={`picker-item-${child.props.value}`}
            onTouchEnd={() => onValueChange(child.props.value)}
          >
            <Text>{child.props.label}</Text>
          </View>
        );
      })}
    </View>
  );

  MockPicker.Item = ({ label, value }: MockPickerItemProps) => (
    <View testID={`picker-item-${value}`}>
      <Text>{label}</Text>
    </View>
  );
  
  return { Picker: MockPicker };
});

describe('Filtering Component Tests', () => {
  let mockUseLocalSearchParams: jest.Mock;
  let mockRouterBack: jest.Mock;
  let mockAsyncStorageSetItem: jest.Mock;
  let mockUseRouter: jest.Mock;

  beforeEach(() => {
    mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    mockUseRouter = useRouter as jest.Mock;
    mockRouterBack = jest.fn(); // Mock router.back function
    mockAsyncStorageSetItem = AsyncStorage.setItem as jest.Mock;
    
    // Setup mock implementations
    mockUseLocalSearchParams.mockReturnValue({});
    mockUseRouter.mockReturnValue({
      back: mockRouterBack,
      push: jest.fn(),
    });
    
    jest.clearAllMocks();
  });

  // ... rest of your test cases remain the same ...

  // T083: Ensure users can filter mentors/mentees using one tag
  it('T083: allows filtering by a single tag', async () => {
    render(<Filtering />);
    
    // Select Software Engineering as career path
    const careerPathPicker = screen.getByText('Career Path');
    expect(careerPathPicker).toBeTruthy();
    
    // Find and select Software Engineering from the dropdown
    fireEvent.press(screen.getByText('Any Career Path'));
    fireEvent.press(screen.getByText('Software Engineering'));
    
    // Apply filters
    fireEvent.press(screen.getByText('Apply Filters'));
    
    // Verify filters were saved to AsyncStorage
    expect(mockAsyncStorageSetItem).toHaveBeenCalledWith(
      'userFilters',
      JSON.stringify({ careerPath: 'Software Engineering' })
    );
    
    // Verify navigation back
    expect(mockRouterBack).toHaveBeenCalled();
  });

  // T084: Ensure multi-tag filtering works
  it('T084: allows filtering by multiple tags', async () => {
    render(<Filtering />);
    
    // Select Finance industry
    const industriesSection = screen.getByText('Interested Industries');
    expect(industriesSection).toBeTruthy();
    
    // Select Finance from the multi-select options
    fireEvent.press(screen.getByText('Finance'));
    
    // Select other filters
    fireEvent.press(screen.getByText('Career Advice'));
    
    // Apply filters
    fireEvent.press(screen.getByText('Apply Filters'));
    
    // Verify filters were saved to AsyncStorage
    expect(mockAsyncStorageSetItem).toHaveBeenCalledWith(
      'userFilters',
      JSON.stringify({
        interestedIndustries: ['Finance'],
        mentorshipAreas: ['Career Advice']
      })
    );
    
    // Verify navigation back
    expect(mockRouterBack).toHaveBeenCalled();
  });

  // T085: Ensure system handles no-match cases
  it('T085: passes rare combination of filters to be handled by results screen', async () => {
    render(<Filtering />);
    
    // For graduation year, select a far future year
    fireEvent.press(screen.getByText('Any Year'));
    fireEvent.press(screen.getByText('2029'));
    
    // For hobbies, select uncommon hobbies
    fireEvent.press(screen.getByText('F1'));
    fireEvent.press(screen.getByText('Pickleball'));
    
    // Apply filters
    fireEvent.press(screen.getByText('Apply Filters'));
    
    // Verify these unusual filters were saved
    expect(mockAsyncStorageSetItem).toHaveBeenCalledWith(
      'userFilters',
      JSON.stringify({
        gradYear: '2029',
        hobbies: ['F1', 'Pickleball']
      })
    );
    
    // Verify navigation back
    expect(mockRouterBack).toHaveBeenCalled();
  });

  // T086: Ensure user can reset filters to view all users again
  it('T086: allows resetting all filters', () => {
    // Start with some pre-existing filters
    mockUseLocalSearchParams.mockReturnValue({
      currentFilters: JSON.stringify({
        major: 'Computer Science',
        gradYear: '2026',
        interestedIndustries: ['Technology', 'Finance'],
        mentorshipAreas: ['Resume Review'],
        hobbies: ['Coding', 'Gaming'],
        careerPath: 'Software Engineering'
      })
    });
    
    render(<Filtering />);
    
    // Verify filters are pre-populated
    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByText('Computer Science')).toBeTruthy();
    expect(screen.getByText('Software Engineering')).toBeTruthy();
    
    // Reset filters
    fireEvent.press(screen.getByText('Reset'));
    
    // Apply the now-empty filters
    fireEvent.press(screen.getByText('Apply Filters'));
    
    // Verify empty object saved to AsyncStorage
    expect(mockAsyncStorageSetItem).toHaveBeenCalledWith(
      'userFilters',
      JSON.stringify({})
    );
    
    // Verify navigation back
    expect(mockRouterBack).toHaveBeenCalled();
  });
});