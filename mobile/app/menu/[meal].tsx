import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useColorScheme, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { globalStyles } from "@/constants/globalStyles";
import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { Colors } from "@/constants/theme";
import { useMeals } from "@/hooks/use-meals";

type MenuItem = {
  day: string;
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
};

type Meal = "breakfast" | "lunch" | "dinner";

export default function MealScreen() {
  const { meal, id } = useLocalSearchParams<{ meal: Meal; id: string }>();
  const router = useRouter();


  const { meals, refreshMeals } = useMeals();
  const isDarkMode = useColorScheme() === "dark";
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const items = meals ? meals[meal] : [];

  return (
    <>
      {meals ? (
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </Pressable>
            <View>
              <ThemedText style={styles.dateLabel}>
                {meals.day}, {meals.date}
              </ThemedText>
              <ThemedText type="title" style={styles.mealTitle}>
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </ThemedText>
            </View>
          </View>

          <ScrollView style={globalStyles.MainContainer} contentContainerStyle={{ paddingBottom: 100 }}>
            {items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.row,
                  index !== items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                ]}
              >
                <Ionicons name="restaurant-outline" size={18} color="#A0A0A0" />
                <ThemedText type="default" style={styles.itemText}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Pressable style={styles.confirmButton}>
              <Ionicons name="checkmark" size={18} color="#fdfeff" />
              <ThemedText style={styles.confirmButtonText}>
                Confirm
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkMode ? Colors.dark.background : "#fdfeff" }}>
          <ActivityIndicator size="large" color={isDarkMode ? "#fdfeff" : Colors.dark.background} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  dateLabel: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  mealTitle: {
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 15,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.dark.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: {
    color: "#fdfeff",
    fontSize: 15,
    fontWeight: "500",
  },
});