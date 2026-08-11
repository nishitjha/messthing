import { useMeals } from '@/hooks/use-meals';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';

import { Colors } from '@/constants/theme';
type ConfirmedMap = Record<number, boolean>;

export default function MainScreen() {
  const {meals, refreshMeals} = useMeals();
  const isDarkMode = useColorScheme() === 'dark';

  function handleConfirm(id: number) {
  }

  function handleViewMenu(id: number) {
  }

  return (
    <>
      {meals ? (    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.date}>{meals.day}, {meals.date}</Text>
        <Text style={styles.heading}>Today's meals</Text>
 
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.mealBlock,
              meals.status[0] === 'present' && styles.mealBlockActive,
            ]}
          >
            <View style={styles.mealHeaderRow}>
              <View style={styles.mealTitleRow}>
                <Text style={styles.icon}>☕</Text>
                <Text
                  style={[
                    styles.mealName,
                    meals.status[0] === 'present' && { color: '#7ab8ff' },
                  ]}
                >
                  Breakfast
                </Text>
              </View>
              <Text style={styles.mealTime}>7:30 – 9:30 am</Text>
            </View>
 
            <Text
              style={[
                styles.mealItems,
                meals.status[0] === 'present' && { color: '#7ab8ff' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {meals.breakfast.join(', ')}
            </Text>
 
            {meals.status[0] !== 'present' ? (
              <View style={styles.doneRow}>
                <Text style={styles.doneText}>{meals.status[0] === 'past' ? 'Past' : 'Upcoming'}</Text>
                <Text style={styles.doneText}>Will do</Text>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    meals.status[0] === 'present' && styles.confirmBtnActive,
                    meals.eaten[0] && styles.confirmBtnDone,
                  ]}
                  onPress={() => handleConfirm(0)}
                >
                  <Text
                    style={[
                      styles.confirmBtnText,
                      meals.status[0] === 'present' && styles.confirmBtnTextActive,
                    ]}
                  >
                    {meals.eaten[0] ? '✓' : '+'} Add to cart
                  </Text>
                </TouchableOpacity>
 
                <TouchableOpacity
                  style={styles.viewMenuBtn}
                  onPress={() => handleViewMenu(meals.id[0])}
                >
                  <Text style={styles.viewMenuBtnText}>View menu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
 
          <View
            style={[
              styles.mealBlock,
              meals.status[1] === 'present' && styles.mealBlockActive,
            ]}
          >
            <View style={styles.mealHeaderRow}>
              <View style={styles.mealTitleRow}>
                <Text style={styles.icon}>🍲</Text>
                <Text
                  style={[
                    styles.mealName,
                    meals.status[1] === 'present' && { color: '#7ab8ff' },
                  ]}
                >
                  Lunch
                </Text>
              </View>
              <Text style={styles.mealTime}>12:30 – 2:30 pm</Text>
            </View>
 
            <Text
              style={[
                styles.mealItems,
                meals.status[1] === 'present' && { color: '#7ab8ff' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {meals.lunch.join(', ')}
            </Text>
 
            {meals.status[1] !== 'present' ? (
              <View style={styles.doneRow}>
                <Text style={styles.doneText}>{meals.status[1] == 'past' ? 'Past' : 'Upcoming'}</Text>
                <Text style={styles.doneText}>Will do</Text>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    meals.status[1] === 'present' && styles.confirmBtnActive,
                    meals.eaten[1] && styles.confirmBtnDone,
                  ]}
                  onPress={() => handleConfirm(1)}
                >
                  <Text
                    style={[
                      styles.confirmBtnText,
                      meals.status[1] === 'present' && styles.confirmBtnTextActive,
                    ]}
                  >
                    {meals.eaten[1] ? '✓' : '+'} Add to cart
                  </Text>
                </TouchableOpacity>
 
                <TouchableOpacity
                  style={styles.viewMenuBtn}
                  onPress={() => handleViewMenu(meals.id[1])}
                >
                  <Text style={styles.viewMenuBtnText}>View menu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
 
          <View
            style={[
              styles.mealBlock,
              meals.status[2] === 'present' && styles.mealBlockActive,
            ]}
          >
            <View style={styles.mealHeaderRow}>
              <View style={styles.mealTitleRow}>
                <Text style={styles.icon}>🌙</Text>
                <Text
                  style={[
                    styles.mealName,
                    meals.status[2] === 'present' && { color: '#7ab8ff' },
                  ]}
                >
                  Dinner
                </Text>
              </View>
              <Text style={styles.mealTime}>7:30 – 9:30 pm</Text>
            </View>
 
            <Text
              style={[
                styles.mealItems,
                meals.status[2] === 'present' && { color: '#7ab8ff' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {meals.dinner.join(', ')}
            </Text>
 
            {meals.status[2] !== 'present' ? (
              <View style={styles.doneRow}>
                <Text style={styles.doneText}>{meals.status[2] === 'past' ? 'Past' : 'Upcoming'}</Text>
                <Text style={styles.checkedInText}>Will do</Text>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    meals.status[2] === 'present' && styles.confirmBtnActive,
                    meals.eaten[2] && styles.confirmBtnDone,
                  ]}
                  onPress={() => handleConfirm(2)}
                >
                  <Text
                    style={[
                      styles.confirmBtnText,
                      meals.status[2] === 'present' && styles.confirmBtnTextActive,
                    ]}
                  >
                    {meals.eaten[2] ? '✓' : '+'} I'm eating dinner
                  </Text>
                </TouchableOpacity>
 
                <TouchableOpacity
                  style={styles.viewMenuBtn}
                  onPress={() => handleViewMenu(meals.id[2])}
                >
                  <Text style={styles.viewMenuBtnText}>View menu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
): (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkMode ? Colors.dark.background : "#fdfeff" }}>
                  <ActivityIndicator size="large" color={isDarkMode ? "#fdfeff" : Colors.dark.background} />
                </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 48,
  },
  card: {
    backgroundColor: Colors.dark.background,
    borderRadius: 24,
    paddingRight: 20,
    paddingLeft: 20,
  },
  date: {
    color: '#9a9a9a',
    fontSize: 14,
    marginBottom: 4,
  },
  heading: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 18,
    marginTop: 4,
  },
  mealBlock: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  mealBlockActive: {
    borderColor: Colors.dark.border
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  mealName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  mealTime: {
    color: '#9a9a9a',
    fontSize: 13,
  },
  mealItems: {
    color: '#d0d0d0',
    fontSize: 15,
    marginBottom: 12,
  },
  doneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  doneText: {
    color: '#888',
    fontSize: 14,
  },
  checkedInText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  confirmBtnDone: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  confirmBtnTextActive: {
    color: '#111',
  },
  viewMenuBtn: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMenuBtnText: {
    color: '#ccc',
    fontWeight: '700',
    fontSize: 15,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 10,
    paddingTop: 16,
  },
  weekLabel: {
    color: '#9a9a9a',
    fontSize: 13,
  },
  weekValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});