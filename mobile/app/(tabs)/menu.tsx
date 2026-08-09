import { ActivityIndicator, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { globalStyles } from "@/constants/globalStyles";
import { useEffect, useState } from "react";
import axios from "@/utils/axios"
import { Colors } from "@/constants/theme";

type MenuItem = {
  day: string;
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export default function TabTwoScreen() {
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const isDarkMode = useColorScheme() === "dark";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("/api/menu");

        response.data.menu.forEach((item: MenuItem) => {
          if (item.day === today) {
            setMenu(item);
          }
        });
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();
  }, []);

  return (
    <>
        {menu ? (

    <ScrollView style={globalStyles.MainContainer}>
      <ThemedView style={globalStyles.TitleContainer}>
        <ThemedText type="title">Today's Menu</ThemedText>
        <ThemedText style={globalStyles.Subtitle} type="default">
          {menu.day}, {menu.date}
        </ThemedText>

        <ThemedView style={{marginTop: 16, marginBottom: 64, flexDirection: "column", gap: 6}}>
          <ThemedText type="subtitle">Breakfast</ThemedText>
          {menu.breakfast.map((item, index) => (
            <ThemedText key={index} type="default" style={{color: "#A0A0A0"}}>
              • {item}
            </ThemedText>
          ))}
          <ThemedView style={{marginTop: 8}} />
          <ThemedText type="subtitle">Lunch</ThemedText>
          {menu.lunch.map((item, index) => (
            <ThemedText key={index} type="default" style={{color: "#A0A0A0"}}>
              • {item}
            </ThemedText>
          ))}
          <ThemedView style={{marginTop: 8}} />
          <ThemedText type="subtitle">Dinner</ThemedText>
          {menu.dinner.map((item, index) => (
            <ThemedText key={index} type="default" style={{color: "#A0A0A0"}}>
              • {item}
            </ThemedText>
          ))}


        </ThemedView>
      </ThemedView>
    </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkMode ? "#151718" : "#fdfeff" }}>
                  <ActivityIndicator size="large" color={isDarkMode ? "#fdfeff" : "#151718"} />
                </View>
        )}
        </>
  );
}

const styles = StyleSheet.create({});
