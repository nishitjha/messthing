import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { globalStyles } from "@/constants/globalStyles";

export default function TabTwoScreen() {
  return (
    <ScrollView style={globalStyles.MainContainer}>
      <ThemedView style={globalStyles.TitleContainer}>
        <ThemedText type="title">Today's Menu</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
