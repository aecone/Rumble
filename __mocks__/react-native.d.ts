// __mocks__/react-native.d.ts
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
}