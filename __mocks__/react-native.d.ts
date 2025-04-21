declare module 'react-native' {
  // Import React types
  import * as React from 'react';


  // Animated and Animation types
  export namespace Animated {
    class Value {
      constructor(val: number);
      interpolate(config: { inputRange: number[], outputRange: any[], extrapolate?: string }): { __getValue: () => any };
      setValue(value: number): void;
    }


    class ValueXY {
      constructor(value?: { x: number, y: number });
      x: Animated.Value;
      y: Animated.Value;
      setValue(value: { x: number, y: number }): void;
      getLayout(): { left: any, top: any };
      getTranslateTransform(): any[];
    }


    // Animation functions
    function timing(
      value: Animated.Value | Animated.ValueXY,
      config: { toValue: number | { x: number, y: number }, duration?: number, useNativeDriver?: boolean }
    ): { start: (callback?: () => void) => void };


    function spring(
      value: Animated.Value | Animated.ValueXY,
      config: { toValue: number | { x: number, y: number }, friction?: number, tension?: number, useNativeDriver?: boolean }
    ): { start: (callback?: () => void) => void };


    function event(
      argMapping: any[],
      config?: { useNativeDriver?: boolean }
    ): (...args: any[]) => void;


    // Animated components
    type AnimatedComponentProps<T> = {
      style?: any;
    } & T;


    class AnimatedComponent {
      // Add animated component methods here if needed
    }


    // Define common animated components
    const View: React.ComponentType<AnimatedComponentProps<ViewProps>>;
    const Text: React.ComponentType<AnimatedComponentProps<TextProps>>;
    const Image: React.ComponentType<AnimatedComponentProps<ImageProps>>;
    const ScrollView: React.ComponentType<AnimatedComponentProps<ScrollViewProps>>;
  }


  // Component Props Interfaces
  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
    onLayout?: (event: any) => void;
    [key: string]: any;
  }


  export interface TextProps {
    style?: any;
    children?: React.ReactNode;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    onPress?: () => void;
    [key: string]: any;
  }


  export interface TextInputProps {
    style?: any;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    [key: string]: any;
  }


  export interface TouchableOpacityProps {
    style?: any;
    onPress?: () => void;
    activeOpacity?: number;
    children?: React.ReactNode;
    [key: string]: any;
  }


  export interface ScrollViewProps {
    contentContainerStyle?: any;
    style?: any;
    children?: React.ReactNode;
    showsVerticalScrollIndicator?: boolean;
    bounces?: boolean;
    onScroll?: (event: any) => void;
    scrollEventThrottle?: number;
    [key: string]: any;
  }


  export interface ImageProps {
    source: { uri: string } | number;
    style?: any;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    onLoad?: () => void;
    [key: string]: any;
  }


  export interface FlatListProps {
    data: any[];
    renderItem: ({ item, index }: { item: any, index: number }) => React.ReactElement;
    keyExtractor?: (item: any, index: number) => string;
    style?: any;
    [key: string]: any;
  }


  // Component Types
  export const Text: React.ComponentType<TextProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const SafeAreaView: React.ComponentType<ViewProps>;
  export const FlatList: React.ComponentType<FlatListProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const Image: React.ComponentType<ImageProps>;
  export const useWindowDimensions: () => { width: number, height: number };
  export const View: React.ComponentType<ViewProps>;
  export const Button: React.ComponentType<{ title: string, onPress?: () => void, [key: string]: any }>;


  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    flatten: (style: any) => any;
    hairlineWidth: number;
    absoluteFill: any;
  };


  export const Alert: {
    alert: (title: string, message?: string, buttons?: Array<{ text: string, onPress?: () => void }>) => void;
  };


  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: <T extends Record<string, any>>(specifics: T) => any;
  };


  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
  };
}


// Additional modules that need to be typed
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


// You might need to add additional type definitions for other libraries
// used in your project such as react-native-gesture-handler
declare module 'react-native-gesture-handler' {
  import * as React from 'react';
 
  export interface PanGestureHandlerProps {
    onGestureEvent?: (event: any) => void;
    onHandlerStateChange?: (event: any) => void;
    children: React.ReactNode;
  }


  export interface PanGestureHandlerStateChangeEvent {
    nativeEvent: {
      oldState: number;
      translationX: number;
      translationY: number;
    };
  }


  export const GestureHandlerRootView: React.ComponentType<{ style?: any, children?: React.ReactNode }>;
  export const PanGestureHandler: React.ComponentType<PanGestureHandlerProps>;
}
