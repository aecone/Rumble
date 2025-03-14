import React from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";

export default function TabFiveScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Messaging Feature</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});