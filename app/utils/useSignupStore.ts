import { create } from 'zustand';

interface SignupState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  major: string;
  gradYear: string;
  ethnicity: string;
  gender: string;
  pronouns: string;
  hobbies: string[];
  careerPath: string;
  interestedIndustries: string[];
  orgs: string[];
  userType: "mentor" | "mentee" | null; 
  mentorshipAreas: string[];

  setField: (field: keyof SignupState, value: any) => void;
  reset: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  birthday: '',
  major: '',
  gradYear: '',
  ethnicity: '',
  gender: '',
  pronouns: '',
  hobbies: [],
  careerPath: '',
  interestedIndustries: [],
  orgs: [],
  userType: null,
  mentorshipAreas: [],
  
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  reset: () => set(() => ({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthday: '',
    major: '',
    gradYear: '',
    ethnicity: '',
    gender: '',
    pronouns: '',
    hobbies: [],
    careerPath: '',
    interestedIndustries: [],
    orgs: [],
    userType: null,
    mentorshipAreas: [],
  }))
}));

