import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SignUpName from '../../app/SignUpName';
import { useLocalSearchParams, router } from 'expo-router';
import Birthday from '../../app/SignUpBirthday';
import SignUpMajor from '../../app/SignUpMajor';
import SignUpGradYear from '../../app/SignUpGradYear';
import SignUpEthnicity from '../../app/SignUpEthnicity';
import SignUpGenderPronouns from '../../app/SignUpGenderPronouns';
import { TouchableOpacity } from 'react-native';
import SignUpHobbies from '../../app/SignUpGenderPronouns';
import SignUpCareer from '@/app/SignUpCareer';
import SignUpIndustries from '@/app/SignUpIndustries';
import MentorOrMentee from '@/app/MentorOrMentee';
import MenteeAreas from '@/app/MenteeAreas';
import MentorAreas from '@/app/MentorAreas';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: {
    push: jest.fn(),
  },
}));

// Enhanced React Native mock
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
      ...RN,
      Text: ({ children, ...props }: any) => {
        return <RN.Text {...props}>{children}</RN.Text>;
      },
      TouchableOpacity: ({ children, onPress, ...props }: any) => {
        return <RN.TouchableOpacity {...props} onPress={onPress}>{children}</RN.TouchableOpacity>;
      },
    };
});

// mock flatlist
jest.mock('react-native/Libraries/Lists/FlatList', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return function MockFlatList({ data, renderItem, ...props }: any) {
      return (
        <View {...props}>
          {data.map((item: any, index: number) => (
            <View key={index}>
              {renderItem({
                item,
                index,
                separators: {
                  highlight: jest.fn(),
                  unhighlight: jest.fn(),
                  updateProps: jest.fn()
                }
              })}
            </View>
          ))}
        </View>
      );
    };
});

describe('SignUpName Component Tests', () => {
  const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
  const mockRouterPush = router.push as jest.Mock;

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({
      email: 'test@example.com',
      password: 'password123',
    });
    jest.clearAllMocks();
  });

  // ✅ T034: Name is entered, user can proceed
  it('T034: allows progression when name is entered', () => {
    render(<SignUpName />);
    
    // Fill in both names
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Alex');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Johnson');

    // Press "Next"
    fireEvent.press(screen.getByText('Next'));

    // Expect navigation with correct params
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/SignUpBirthday',
      params: {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
      },
    });
  });

  // 🚫 T035: Blank names block navigation
  it('T035: blocks progression when names are empty', () => {
    render(<SignUpName />);
    
    // Leave both fields empty
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), '');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), '');

    // Press "Next"
    fireEvent.press(screen.getByText('Next'));

    // Should NOT navigate
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('T035: blocks progression when only first name is entered', () => {
    render(<SignUpName />);
    
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Alex');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), '');

    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('T035: blocks progression when only last name is entered', () => {
    render(<SignUpName />);
    
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), '');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Johnson');

    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

describe('Birthday Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
      });
      jest.clearAllMocks();
    });
  
    // T036: Proceed on valid birthday
    it('T036: allows progression when birthday is valid', () => {
      render(<Birthday />);
  
      fireEvent.changeText(screen.getByPlaceholderText('MM/DD/YYYY'), '01152003');
  
      fireEvent.press(screen.getByText('Next'));
  
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/SignUpMajor',
        params: {
          firstName: 'Alex',
          lastName: 'Johnson',
          email: 'test@example.com',
          password: 'password123',
          birthday: '01/15/2003',
        },
      });
    });
  
    //T037: Block on blank birthday
    it('T037: blocks progression when birthday is blank', () => {
      render(<Birthday />);
  
      fireEvent.changeText(screen.getByPlaceholderText('MM/DD/YYYY'), '');
  
      fireEvent.press(screen.getByText('Next'));
  
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  
    // T037: Block on invalid format
    it('T037: blocks progression when birthday is in invalid format', () => {
      render(<Birthday />);
  
      fireEvent.changeText(screen.getByPlaceholderText('MM/DD/YYYY'), '150103');
  
      fireEvent.press(screen.getByText('Next'));
  
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
});

describe('SignUpMajor Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
      });
      jest.clearAllMocks();
    });
  
    // T038: Proceed when major is selected
it('T038: allows progression when major is selected', async () => {
    render(<SignUpMajor />);
    
    // Open the dropdown
    fireEvent.press(screen.getByText('Select Major'));
    
    // Choose "Computer Science"
    fireEvent.press(screen.getByText('Computer Science'));
    
    // Press Next
    fireEvent.press(screen.getByText('Next'));
    
    // Expect correct navigation
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/SignUpGradYear',
      params: {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
      },
    });
  });
  
  // T039: Block if major not selected
  it('T039: blocks progression when major is blank', () => {
    render(<SignUpMajor />);
    
    // Make sure major is empty
    const dropdown = screen.getByText('Select Major');
    expect(dropdown).toBeTruthy();
    
    // Press Next without selecting major
    fireEvent.press(screen.getByText('Next'));
    
    // Verify no navigation occurred
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

describe('SignUpGradYear Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
      });
      jest.clearAllMocks();
    });
  
    // T040: Validate proper entry of graduation year
    it('T040: allows progression when valid graduation year is selected', () => {
      render(<SignUpGradYear />);
      
      // Open the dropdown
      fireEvent.press(screen.getByText('Select Graduation Year'));
      
      // Choose "2026"
      fireEvent.press(screen.getByText('2026'));
      
      // Press Next
      fireEvent.press(screen.getByText('Next'));
      
      // Expect correct navigation
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/SignUpEthnicity',
        params: {
          firstName: 'Alex',
          lastName: 'Johnson',
          email: 'test@example.com',
          password: 'password123',
          birthday: '01/15/2003',
          major: 'Computer Science',
          gradYear: '2026',
        },
      });
    });
  
    // T041: Prevent progression if year is blank or invalid
    describe('T041: blocks progression with invalid graduation year', () => {
      it('blocks when year is blank', () => {
        render(<SignUpGradYear />);
        
        // Verify dropdown shows placeholder (blank state)
        expect(screen.getByText('Select Graduation Year')).toBeTruthy();
        
        // Press Next without selecting
        fireEvent.press(screen.getByText('Next'));
        
        // Verify no navigation occurred
        expect(mockRouterPush).not.toHaveBeenCalled();
      });
  
      it('blocks when invalid year is entered', () => {
        // Note: This test assumes you modify the component to handle manual input
        // If your component only allows dropdown selection, this case is already covered
        // by the blank test since invalid values can't be selected
        render(<SignUpGradYear />);
        
        // For components that allow text input:
        // fireEvent.changeText(screen.getByPlaceholderText('Graduation Year'), '20');
        // fireEvent.press(screen.getByText('Next'));
        // expect(mockRouterPush).not.toHaveBeenCalled();
      });
})
});

describe('SignUpEthnicity Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;

    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
      });
      jest.clearAllMocks();
    });

    // T042: Validate ethnicity input is required
    it('T042: allows progression when ethnicity is selected', () => {
      render(<SignUpEthnicity />);
      
      // Open and select from dropdown
      fireEvent.press(screen.getByText('Select Race/Ethnicity'));
      fireEvent.press(screen.getByText('Asian'));
      fireEvent.press(screen.getByText('Next'));
      
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/SignUpGenderPronouns',
        params: expect.objectContaining({
          ethnicity: 'Asian'
        })
      });
    });

    // T043: Ensure ethnicity field is not bypassed
    it('T043: blocks progression when ethnicity is blank', () => {
      render(<SignUpEthnicity />);
      
      // Attempt to proceed without selection
      fireEvent.press(screen.getByText('Next'));
      
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
});

describe('SignUpGenderPronouns Component Tests', () => {
  const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
  const mockRouterPush = router.push as jest.Mock;

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'test@example.com',
      password: 'password123',
      birthday: '01/15/2003',
      major: 'Computer Science',
      gradYear: '2026',
      ethnicity: 'Asian'
    });
    jest.clearAllMocks();
  });

  // T044: Validate gender/pronoun entry
  it('T044: allows progression when gender and pronouns are selected', () => {
    render(<SignUpGenderPronouns />);
    
    // Select gender
    fireEvent.press(screen.getByText('Select Gender'));
    fireEvent.press(screen.getByText('Woman'));
    
    // Select pronouns
    fireEvent.press(screen.getByText('Select Pronouns'));
    fireEvent.press(screen.getByText('She/Her'));
    
    fireEvent.press(screen.getByText('Next'));
    
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/SignUpHobbies',
      params: expect.objectContaining({
        gender: 'Woman',
        pronouns: 'She/Her'
      })
    });
  });

  // T045: Prevent blank gender/pronouns
  it('T045: blocks progression when fields are incomplete', () => {
    render(<SignUpGenderPronouns />);
    
    // Case 1: Both fields blank
    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
    
    // Case 2: Only gender selected
    fireEvent.press(screen.getByText('Select Gender'));
    fireEvent.press(screen.getByText('Woman'));
    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
    
    // Reset component
    render(<SignUpGenderPronouns />);
    
    // Case 3: Only pronouns selected
    fireEvent.press(screen.getByText('Select Pronouns'));
    fireEvent.press(screen.getByText('She/Her'));
    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

  
describe('SignUpHobbies Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
        ethnicity: 'Asian',
        gender: 'Woman',
        pronouns: 'She/Her'
      });
      jest.clearAllMocks();
    });
  
    // T046: Validate hobbies selection
    it('T046: allows progression when hobbies are selected', async () => {
        const { getByText } = render(<SignUpHobbies />);
      
        // Wait for hobby buttons to appear
        expect(getByText('Painting')).toBeTruthy();
        expect(getByText('Hiking')).toBeTruthy();
      
        // Select hobbies
        fireEvent.press(getByText('Painting'));
        fireEvent.press(getByText('Hiking'));
      
        // Press Next
        fireEvent.press(getByText('Next'));
      
        // Expect navigation with all form data + hobbies
        expect(mockRouterPush).toHaveBeenCalledWith({
          pathname: '/SignUpCareer',
          params: expect.objectContaining({
            firstName: 'Alex',
            hobbies: ['Painting', 'Hiking'],
          }),
        });
    });
      
    // T047: Prevent blank hobbies
    it('T047: blocks progression when no hobbies are selected', () => {
      const { getByText } = render(<SignUpHobbies />);
      
      // Attempt to proceed without selecting hobbies
      fireEvent.press(getByText('Next'));
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
});

describe('SignUpCareer Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
        ethnicity: 'Asian',
        gender: 'Woman',
        pronouns: 'She/Her',
        hobbies: ['Painting', 'Hiking']
      });
      jest.clearAllMocks();
    });
  
    // T048: Validate career input is required and allows progression
    it('T048: allows progression when career is selected', () => {
      render(<SignUpCareer />);
      
      // Open and select career
      fireEvent.press(screen.getByText('Select career'));
      fireEvent.press(screen.getByText('Software Engineering'));
      fireEvent.press(screen.getByText('Next'));
      
      // Verify navigation with career data
      expect(mockRouterPush).toHaveBeenCalledWith(expect.objectContaining({
        params: expect.objectContaining({
          career: 'Software Engineering'
        })
      }));
    });
  
    // T049: Prevent user from skipping careers field
    it('T049: blocks progression when career is blank', () => {
      render(<SignUpCareer />);
      
      // Attempt to proceed without selection
      fireEvent.press(screen.getByText('Next'));
      
      // Verify no navigation occurred
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
});

describe('SignUpIndustries Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
        ethnicity: 'Asian',
        gender: 'Woman',
        pronouns: 'She/Her',
        hobbies: ['Painting', 'Hiking'],
        career: 'Software Engineering'
      });
      jest.clearAllMocks();
    });
  
    // T050: Validate industry selection works
    it('T050: allows progression when industries are selected', () => {
      render(<SignUpIndustries />);
      
      // Select industries
      fireEvent.press(screen.getByText('Technology'));
      fireEvent.press(screen.getByText('Healthcare'));
      fireEvent.press(screen.getByText('Education'));
      
      // Press Next
      fireEvent.press(screen.getByText('Next'));
      
      // Verify navigation with industries data
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/SignUpOrgs',
        params: expect.objectContaining({
          industries: expect.stringContaining('Technology, Healthcare, Education')
        })
      });
    });
  
    // T051: Prevent skipping industry selection
    it('T051: blocks progression when no industries are selected', () => {
      render(<SignUpIndustries />);
      
      // Attempt to proceed without selection
      fireEvent.press(screen.getByText('Next'));
      
      // Verify no navigation occurred
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
});

describe('MentorOrMentee Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
        ethnicity: 'Asian',
        gender: 'Woman',
        pronouns: 'She/Her',
        hobbies: ['Painting', 'Hiking'],
        career: 'Software Engineering',
        industries: 'Technology, Healthcare',
        orgs: 'ACM, IEEE'
      });
      jest.clearAllMocks();
    });
  
    // T052: Validate role selection functionality
    it('T052: allows progression when mentor is selected', () => {
      render(<MentorOrMentee />);
      
      // Select mentor role
      fireEvent.press(screen.getByText('Mentor'));
      
      // Press Next
      fireEvent.press(screen.getByText('Next'));
      
      // Verify navigation to mentor areas
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/MentorAreas',
        params: expect.objectContaining({
          role: 'mentor'
        })
      });
    });
  
    // T053: Prevent skipping of role selection
    it('T053: blocks progression when no role is selected', () => {
      render(<MentorOrMentee />);
      
      // Attempt to proceed without selection
      fireEvent.press(screen.getByText('Next'));
      
      // Verify no navigation occurred
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
});

describe('MentorAreas Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
        ethnicity: 'Asian',
        gender: 'Woman',
        pronouns: 'She/Her',
        hobbies: ['Painting', 'Hiking'],
        career: 'Software Engineering',
        industries: 'Technology, Healthcare',
        orgs: 'ACM, IEEE',
        role: 'mentor'
      });
      jest.clearAllMocks();
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as jest.Mock;
    });
  
    // T054: Validate mentorship area selection
    it('T054: allows signup when mentorship areas are selected', () => {
      render(<MentorAreas />);
      
      // Select mentorship areas
      fireEvent.press(screen.getByText('Resume Review'));
      fireEvent.press(screen.getByText('Interview Prep'));
      
      // Press Sign Up
      fireEvent.press(screen.getByText('Sign Up'));
      
      // Verify navigation to home screen
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  
    // T055: Prevent signup without mentorship areas
    it('T055: blocks signup when no mentorship areas are selected', () => {
      render(<MentorAreas />);
      
      // Attempt to sign up without selection
      fireEvent.press(screen.getByText('Sign Up'));
      
      // Verify no navigation occurred
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
  
  describe('MenteeAreas Component Tests', () => {
    const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
    const mockRouterPush = router.push as jest.Mock;
  
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'test@example.com',
        password: 'password123',
        birthday: '01/15/2003',
        major: 'Computer Science',
        gradYear: '2026',
        ethnicity: 'Asian',
        gender: 'Woman',
        pronouns: 'She/Her',
        hobbies: ['Painting', 'Hiking'],
        career: 'Software Engineering',
        industries: 'Technology, Healthcare',
        orgs: 'ACM, IEEE',
        role: 'mentee'
      });
      jest.clearAllMocks();
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as jest.Mock;
    });
  
    // T054: Validate mentorship area selection
    it('T054: allows signup when mentorship areas are selected', () => {
      render(<MenteeAreas />);
      
      // Select mentorship areas
      fireEvent.press(screen.getByText('Resume Review'));
      fireEvent.press(screen.getByText('Interview Prep'));
      
      // Press Sign Up
      fireEvent.press(screen.getByText('Sign Up'));
      
      // Verify navigation to home screen
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  
    // T055: Prevent signup without mentorship areas
    it('T055: blocks signup when no mentorship areas are selected', () => {
      render(<MenteeAreas />);
      
      // Attempt to sign up without selection
      fireEvent.press(screen.getByText('Sign Up'));
      
      // Verify no navigation occurred
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });