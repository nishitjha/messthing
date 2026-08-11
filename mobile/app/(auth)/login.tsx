import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { globalStyles } from "@/constants/globalStyles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useGreeting } from "@/hooks/use-greeting";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen() {
  const greeting = useGreeting();
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    //@ts-ignore
    <ScrollView contentContainerStyle={globalStyles.CenteredContainer}>
      <ThemedView style={globalStyles.TitleContainer}>
        <ThemedText type="title">Login</ThemedText>
      </ThemedView>

      <ThemedView style={globalStyles.GreetingContainer}>
        <ThemedText
          type="default"
          lightColor={Colors.light.subtitle}
          darkColor={Colors.dark.subtitle}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          {greeting} Please log in with your BITSP Email ID to continue.
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={signInWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.dark.background} />
        ) : (
          <ThemedText style={styles.buttonText}>
            Continue with Google
          </ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: "#fdfeff",
    color: Colors.dark.background,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
