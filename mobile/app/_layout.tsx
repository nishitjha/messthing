

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();

const TextComponent = Text as any;
const originalRender = TextComponent.render;
TextComponent.render = function (props: any, ref: any) {
  const newProps = {
    ...props,
    style: [{ fontFamily: "Inter_400Regular" }, props.style],
  };
  return originalRender.call(this, newProps, ref);
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
  async deleteToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      return;
    }
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

function InitialLayout() {
  const { isAuthenticated, isLoading, signedInWithOtherID } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isDarkMode = useColorScheme() === "dark";

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments as string[]).includes("(auth)");

    if (signedInWithOtherID) {
      router.replace("/(auth)/nonbits");
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }
  }, [isAuthenticated, isLoading, segments, signedInWithOtherID]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkMode ? Colors.dark.background : "#fdfeff" }}>
        <ActivityIndicator size="large" color={isDarkMode ? "#fdfeff" : Colors.dark.background} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ClerkProvider>
  );
}
