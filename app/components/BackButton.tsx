// app/components/BackButton.tsx

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSignupNavigation } from "../hooks/useSignupNavigation";

interface BackButtonProps {
  style?: ViewStyle; // container style
  textStyle?: TextStyle; // text style
}

export function BackButton({ style, textStyle }: BackButtonProps) {
  const { onBack } = useSignupNavigation();

  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={onBack}>
<Text style={[styles.backText, textStyle]}>← Back </Text>  
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backText: {
    color: "white",
    fontSize: 16,
  },
});
