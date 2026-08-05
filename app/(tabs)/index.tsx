import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { globalStyles } from "@/constants/globalStyles";
import { Colors } from "@/constants/theme";
import { useGreeting } from "@/hooks/use-greeting";

export default function HomeScreen() {
  const greeting = useGreeting();

  return (
    <ScrollView style={globalStyles.MainContainer}>
      <ThemedView style={globalStyles.TitleContainer}>
        <ThemedText type="title">MessThing</ThemedText>
      </ThemedView>
      <ThemedView style={styles.greetingContainer}>
        <ThemedText
          type="default"
          lightColor={Colors.light.subtitle}
          darkColor={Colors.dark.subtitle}
        >
          {greeting}
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greetingContainer: {
    gap: 8,
    marginTop: 8,
    backgroundColor: Colors.dark.background,
  },
});
