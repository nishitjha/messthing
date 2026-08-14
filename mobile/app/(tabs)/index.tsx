import { useMeals } from '@/hooks/use-meals';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

const ACCENT = '#C9A66B';
const TEXT_PRIMARY = '#EDE3D3';
const TEXT_SECONDARY = '#8C7B68';
const TEXT_MUTED = '#6E6152';
const PAST_OVERLAY = 'rgba(26, 21, 18, 0.5)';

const MEAL_ICONS = {
  breakfast: { Comp: Ionicons, name: 'cafe-outline' },
  lunch: { Comp: Ionicons, name: 'restaurant-outline' },
  dinner: { Comp: MaterialCommunityIcons, name: 'pot-steam-outline' },
} as const;

export default function MainScreen() {
  const { meals, refreshMeals } = useMeals();
  const isDarkMode = useColorScheme() === 'dark';

  function handleConfirm(id: number) {}


  function handleViewMenu(mealName: keyof typeof MEAL_ICONS, id: number) {
    router.push({
      pathname: '/menu/[meal]',
      params: { meal: mealName, id: String(id) },
    });
  }


  function renderMeal(
    index: 0 | 1 | 2,
    iconName: keyof typeof MEAL_ICONS,
    label: string,
    time: string,
    items: string[],
    confirmLabel: string
  ) {
    const status = meals!.status[index];
    const isActive = status === 'present';
    const isPast = status === 'past';
    const isUpcoming = !isActive && !isPast;

    if (!meals) return null;

    return (
      <View style={[styles.mealBlock, isActive && styles.mealBlockActive]}>
        {!isActive && <View style={styles.dim} pointerEvents="none" />}

        <View style={styles.mealHeaderRow}>
          <View style={styles.mealTitleRow}>
            {(() => {
              const { Comp, name } = MEAL_ICONS[iconName];
              return (
                <Comp
                  name={name as never}
                  size={20}
                  color={isActive ? ACCENT : TEXT_SECONDARY}
                  style={styles.icon}
                />
              );
            })()}
            <Text style={[styles.mealName, isActive && styles.mealNameActive]}>
              {label}
            </Text>
          </View>
          <Text style={styles.mealTime}>{time}</Text>
        </View>

        {!isPast && (
          <View style={styles.chipRow}>
            {(isActive ? items : items.slice(0, 2)).map((item, i) => (
              <View
                key={i}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {item}
                </Text>
              </View>
            ))}
            {isUpcoming && items.length > 4 && (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleViewMenu(iconName, meals!.id[index])}
              >
                <Text style={styles.chipText}>
                  +{items.length - 2} more · See menu
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {isActive ? (
          <View style={styles.tearLine} />
        ) : (null
        )}
        {!isActive ? (
          <>

            <View style={styles.doneRow}>
              <Text style={styles.doneText}>{isPast ? 'Past' : 'Upcoming'}</Text>
              <Text style={styles.doneText}>Will do</Text>
            </View>
          </>
        ) : (
          
          <View style={styles.actionRow}>
            
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                styles.confirmBtnActive,
                meals!.eaten[index] && styles.confirmBtnDone,
              ]}
              onPress={() => handleConfirm(index)}
            >
              <Ionicons
                name={meals!.eaten[index] ? 'checkmark' : 'add'}
                size={24}
                color="#17140F"
                style={styles.confirmBtnIcon}
              />
              <Text style={styles.confirmBtnTextActive}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <>
      {meals ? (
        <View style={styles.screen}>
          <View style={styles.card}>
            <Text style={styles.date}>
              {meals.day}, {meals.date}
            </Text>
            <Text style={styles.heading}>Today's meals</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderMeal(0, 'breakfast', 'Breakfast', '7:30 – 9:30 am', meals.breakfast, 'Add to cart')}
              {renderMeal(1, 'lunch', 'Lunch', '12:30 – 2:30 pm', meals.lunch, 'Add to cart')}
              {renderMeal(2, 'dinner', 'Dinner', '7:30 – 9:30 pm', meals.dinner, 'Add to cart')}
            </ScrollView>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? Colors.dark.background : '#fdfeff',
          }}
        >
          <ActivityIndicator size="large" color={isDarkMode ? '#fdfeff' : Colors.dark.background} />
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
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 4,
  },
  heading: {
    color: TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
    marginTop: 2,
  },
  mealBlock: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  mealBlockActive: {
    borderColor: ACCENT,
  },
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PAST_OVERLAY,
    borderRadius: 16,
    zIndex: 1,
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
    marginRight: 10,
    marginTop: 1.5
  },
  mealName: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  mealNameActive: {
    color: ACCENT,
  },
  mealTime: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    marginTop: 6
  },
  chip: {
    borderWidth: 1,
    borderColor: '#3A2E23',
    backgroundColor: '#241D17',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  chipActive: {
    borderColor: 'rgba(201, 166, 107, 0.4)',
    backgroundColor: 'rgba(201, 166, 107, 0.12)',
  },
  chipText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: ACCENT,
  },
  tearLine: {
    borderTopWidth: 1,
    borderTopColor: '#3A2E23',
    borderStyle: 'dashed',
    marginTop: 4,
    marginBottom: 14,
  },
  doneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  doneText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop:1
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#3A2E23',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  confirmBtnDone: {
    opacity: 0.6,
  },
  confirmBtnIcon: {
    marginRight: 6,
  },
  confirmBtnTextActive: {
    color: '#17140F',
    fontWeight: '700',
    fontSize: 15,
  },
  viewMenuBtn: {
    borderWidth: 1,
    borderColor: '#3A2E23',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMenuBtnText: {
    color: TEXT_SECONDARY,
    fontWeight: '700',
    fontSize: 15,
  },
});