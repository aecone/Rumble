
import { signupStepPaths } from "./routes";

// Always turn input into a clean array
export const normalizeToArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
    return [];
  };
  
  // Toggle a value inside an array safely
  export const toggleValueInArray = (array: any, value: string): string[] => {
    const arr = normalizeToArray(array);
    return arr.includes(value)
      ? arr.filter(v => v !== value)
      : [...arr, value];
  };
  
  

export const baseSignupStepOrder = [
  signupStepPaths.SignUpName,
  signupStepPaths.SignUpBirthday,
  signupStepPaths.SignUpMajor,
  signupStepPaths.SignUpGradYear,
  signupStepPaths.SignUpEthnicity,
  signupStepPaths.SignUpGenderPronouns,
  signupStepPaths.SignUpHobbies,
  signupStepPaths.SignUpCareer,
  signupStepPaths.SignUpIndustries,
  signupStepPaths.SignUpOrgs,
  signupStepPaths.MentorOrMentee,
];
export type SignupStepPath =
  | (typeof baseSignupStepOrder)[number]
  | typeof signupStepPaths.MentorAreas
  | typeof signupStepPaths.MenteeAreas;

export function getFullSignupStepOrder(userType: "mentor" | "mentee" | null): SignupStepPath[] {
  if (userType === "mentor") {
    return [...baseSignupStepOrder, signupStepPaths.MentorAreas];
  } else if (userType === "mentee") {
    return [...baseSignupStepOrder, signupStepPaths.MenteeAreas];
  } else {
    return baseSignupStepOrder;
  }
}