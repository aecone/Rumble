declare module 'react-native' {
  export const Text: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const SafeAreaView: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;

  export const StyleSheet: {
    create: (styles: any) => any;
    flatten: (style: any) => any;
    hairlineWidth: number;
    absoluteFill: any;
  };

  export const View: React.ComponentType<any>;
  export const Button: React.ComponentType<any>;

  export const Alert: {
    alert: (title: string, message?: string) => void;
  };

  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: (specifics: { [platform: string]: any }) => any;
  };

  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
  };
}

// types/mocks.d.ts
declare module 'react-native-dropdown-picker' {
  import { ReactNode } from 'react';
  import { StyleProp, ViewStyle, TextStyle } from 'react-native';

  export interface DropDownPickerProps {
    open: boolean;
    value: any;
    items: Array<{ label: string; value: any }>;
    setOpen: (open: boolean) => void;
    setValue: (value: any) => void;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    // Add other props as needed
  }

  const DropDownPicker: React.FC<DropDownPickerProps>;
  export default DropDownPicker;
}