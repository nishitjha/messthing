import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { globalStyles } from "@/constants/globalStyles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useGreeting } from "@/hooks/use-greeting";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function NonBitsScreen() {
  const router = useRouter();
  const greeting = useGreeting();
  const { isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleReturnToLogin = async () => {
    setIsSigningOut(true);
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    //@ts-ignore
    <ScrollView contentContainerStyle={globalStyles.CenteredContainer}>
      <ThemedView style={globalStyles.TitleContainer}>
        <ThemedText type="title">You fucking moron.</ThemedText>
      </ThemedView>

      <ThemedView style={globalStyles.GreetingContainer}>
        <ThemedText
          type="default"
          lightColor={Colors.light.subtitle}
          darkColor={Colors.dark.subtitle}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          You can only log in with your BITSP Email ID. Please try again.
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleReturnToLogin}
        disabled={isLoading || isSigningOut}
      >
        {isLoading || isSigningOut ? (
          <ActivityIndicator color={Colors.dark.background} />
        ) : (
          <ThemedText style={styles.buttonText}>Return to Login</ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: "#fdfeff",
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
