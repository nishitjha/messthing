import { useMeals } from '@/hooks/use-meals';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import axios from '@/utils/axios';
import { useAuth } from '@clerk/clerk-expo';

const ACCENT = '#C9A66B';
const TEXT_PRIMARY = '#EDE3D3';
const TEXT_SECONDARY = '#8C7B68';
const TEXT_MUTED = '#6E6152';
const PAST_OVERLAY = 'rgba(26, 21, 18, 0.5)';
const MAX_VISIBLE_ROWS = 4;

type MealIconConfig = { lib: 'ion' | 'mdi'; name: string };

const MEAL_ICONS: Record<'breakfast' | 'lunch' | 'dinner', MealIconConfig> = {
  breakfast: { lib: 'ion', name: 'cafe-outline' },
  lunch: { lib: 'ion', name: 'restaurant-outline' },
  dinner: { lib: 'mdi', name: 'pot-steam-outline' },
};

function MealIcon({
  config,
  size,
  color,
  style,
}: {
  config: MealIconConfig;
  size: number;
  color: string;
  style?: object;
}) {
  if (config.lib === 'mdi') {
    return (
      <MaterialCommunityIcons name={config.name as any} size={size} color={color} style={style} />
    );
  }
  return <Ionicons name={config.name as any} size={size} color={color} style={style} />;
}

type PreviousMealEntry = {
  id: string;
  day: string;
  mealType: keyof typeof MEAL_ICONS;
  status: 'logged' | 'skipped';
  items?: string[];
};

const HARDCODED_PREVIOUS_MEALS: PreviousMealEntry[] = [
  {
    id: '1',
    day: 'Today',
    mealType: 'breakfast',
    status: 'logged',
    items: ['Egg bhurji', 'Bread + jam'],
  },
  {
    id: '2',
    day: 'Today',
    mealType: 'lunch',
    status: 'skipped',
  },
  {
    id: '3',
    day: 'Yesterday',
    mealType: 'breakfast',
    status: 'logged',
    items: ['Poha', 'Tea'],
  },
  {
    id: '4',
    day: 'Yesterday',
    mealType: 'lunch',
    status: 'logged',
    items: ['Dal tadka', 'Rice', 'Roti', 'Curd'],
  },
  {
    id: '5',
    day: 'Yesterday',
    mealType: 'dinner',
    status: 'skipped',
  },
];

function PreviousMeals({ meals }: { meals: PreviousMealEntry[] }) {
  const entries = meals ?? [];
  const [expanded, setExpanded] = useState(false);

  if (!entries || entries.length === 0) {
    return (
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={styles.heading}>Previous meals</Text>
        <Text style={{ color: TEXT_MUTED, fontSize: 15, marginTop: -4 }}>
          You haven't had any meals this week.
        </Text>
      </View>
    );
  }

  const groups: { day: string; items: PreviousMealEntry[] }[] = [];
  entries.forEach((entry) => {
    const group = groups.find((g) => g.day === entry.day);
    if (group) {
      group.items.push(entry);
    } else {
      groups.push({ day: entry.day, items: [entry] });
    }
  });

  const visibleGroups: typeof groups = [];
  let rowCount = 0;
  for (const group of groups) {
    if (!expanded && rowCount >= MAX_VISIBLE_ROWS) break;
    const remaining = MAX_VISIBLE_ROWS - rowCount;
    const items = expanded ? group.items : group.items.slice(0, remaining);
    if (items.length > 0) {
      visibleGroups.push({ day: group.day, items });
      rowCount += items.length;
    }
  }

  const hasMore = entries.length > rowCount && !expanded;

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 64}}>
      <Text style={styles.headingtwo}>Previous meals</Text>

      <View style={styles.timelineCard}>
        {visibleGroups.map((group, gi) => (
          <View key={group.day}>
            <Text style={[styles.dayLabel, gi !== 0 && styles.dayLabelSpaced]}>
              {group.day}
            </Text>

            {group.items.map((entry, i) => {
              const iconConfig = MEAL_ICONS[entry.mealType];
              const isLogged = entry.status === 'logged';

              return (
                <View
                  key={entry.id}
                  style={[styles.timelineRow]}
                >
                  <MealIcon
                    config={iconConfig}
                    size={18}
                    color={isLogged ? ACCENT : TEXT_MUTED}
                    style={[styles.icon, { marginRight: 0 }]}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.mealHeaderRow}>
                      <Text
                        style={[
                          styles.mealName,
                          { fontSize: 15 },
                          !isLogged && { color: TEXT_SECONDARY },
                        ]}
                      >
                        {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
                      </Text>
                      <Text style={isLogged ? styles.timelineLogged : styles.doneText}>
                        {isLogged ? 'Logged' : 'Skipped'}
                      </Text>
                    </View>

                    {isLogged && entry.items && entry.items.length > 0 && (
                      <View style={[styles.chipRow, { marginBottom: 0 }]}>
                        {entry.items.slice(0, 2).map((item, ii) => (
                          <View key={ii} style={styles.chip}>
                            <Text style={styles.chipText}>{item}</Text>
                          </View>
                        ))}
                        {entry.items.length > 2 && (
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>+{entry.items.length - 2} more</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity onPress={() => setExpanded(true)} style={styles.seeFullBtn}>
          <Text style={styles.seeFullText}>See all...</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MainScreen() {
  const { meals, refreshMeals, eaten, isItSunday, user, mealsThisWeek } = useMeals();
  const { getToken } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmMealId, setConfirmMealId] = useState<string | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

  async function handleConfirm(id: string) {
    const token = await getToken();

    const response = await axios.get(`/users/${user?.id}/eat/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      setRefreshing(true);
    } else {
      console.error('Error confirming meal:', response.data.message);
    }
  }

  useEffect(() => {
    if (refreshing) {
      refreshMeals();
      setRefreshing(false);
    }
  }, [refreshing]);

  function handleViewMenu(mealName: keyof typeof MEAL_ICONS, id: number) {
    router.push({
      pathname: '/menu/[meal]',
      params: { meal: mealName, id: String(id) },
    });
  }

  function mealCard(
    index: 0 | 1 | 2,
    iconName: keyof typeof MEAL_ICONS,
    label: string,
    time: string,
    items: string[],
    eaten: string[],
    id: string
  ) {
    if (!meals) return null;

    const status = meals.status[index];
    const isActive = status === 'present';
    const isPast = status === 'past';
    const isUpcoming = !isActive && !isPast;
    const isEaten = eaten.includes(id);

    return (
      <View style={[styles.mealBlock, isActive && styles.mealBlockActive]}>
        {!isActive && <View style={styles.dim} pointerEvents="none" />}

        <View style={styles.mealHeaderRow}>
          <View style={styles.mealTitleRow}>
            <MealIcon
              config={MEAL_ICONS[iconName]}
              size={20}
              color={isActive || isEaten ? ACCENT : TEXT_SECONDARY}
              style={styles.icon}
            />
            <Text style={[styles.mealName, isActive && styles.mealNameActive]}>
              {label}
            </Text>
          </View>
          <Text style={styles.mealTime}>{time}</Text>
        </View>

        {!isPast && (
          <View style={styles.chipRow}>
            {(isActive ? items : items.slice(0, 3)).map((item, i) => (
              <View key={i} style={[styles.chip, isActive && styles.chipActive]}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {item}
                </Text>
              </View>
            ))}
            {isUpcoming && items.length > 3 && (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleViewMenu(iconName, meals.id[index])}
              >
                <Text style={styles.chipText}>+{items.length - 3} more</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isActive && <View style={styles.tearLine} />}

        {!isActive ? (
          <View style={styles.doneRow}>
            <Text style={styles.doneText}>{isPast ? 'Finished' : 'Upcoming'}</Text>
            <Text
              style={isUpcoming ? styles.seeMenuText : isEaten ? styles.loggedText : styles.doneText}
              onPress={isUpcoming ? () => handleViewMenu(iconName, meals.id[index]) : undefined}
            >
              {isUpcoming ? 'See menu' : isEaten ? 'Logged' : 'Skipped'}
            </Text>
          </View>
        ) : isEaten ? (
          <View style={styles.doneRow}>
            <Text style={styles.loggedText}>Logged</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.confirmBtnActive]}
              onPress={() => setConfirmMealId(id)}
            >
              <Ionicons name="add" size={24} color="#17140F" style={styles.confirmBtnIcon} />
              <Text style={styles.confirmBtnTextActive}>Add to cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <>
      {meals ? (
        <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.date}>
              {meals.day}, {meals.date}
            </Text>
            <Text style={styles.heading}>Today's meals</Text>
            <View style={{ marginTop: 8 }} />

            {mealCard(
              0,
              'breakfast',
              'Breakfast',
              isItSunday ? '8:00 am to 10:00 am' : '7:30 am to 9:30 am',
              meals.breakfast,
              eaten,
              String(meals.id[0])
            )}
            {mealCard(
              1,
              'lunch',
              'Lunch',
              isItSunday ? '12:00 pm to 2:00 pm' : '11:30 am to 1:30 pm',
              meals.lunch,
              eaten,
              String(meals.id[1])
            )}
            {mealCard(
              2,
              'dinner',
              'Dinner',
              '7:15 pm to 8:30 pm',
              meals.dinner,
              eaten,
              String(meals.id[2])
            )}
          </View>

          <PreviousMeals meals={mealsThisWeek} />
        </ScrollView>
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

      <Modal
        visible={confirmMealId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmMealId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add to cart?</Text>
            <Text style={styles.modalBody}>Do you wish to add this meal to your cart?</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnNo}
                onPress={() => setConfirmMealId(null)}
              >
                <Text style={styles.modalBtnNoText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnYes}
                onPress={() => {
                  const id = confirmMealId;
                  setConfirmMealId(null);
                  if (id) handleConfirm(id);
                }}
              >
                <Text style={styles.modalBtnYesText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 48,
    width: '100%',
  },
  loggedText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
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
    marginTop: 2,
    marginBottom: 12,
  },
  headingtwo: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
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
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    marginTop: 1.5,
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
    marginTop: 6,
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
  seeMenuText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  doneText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 1,
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
  confirmBtnIcon: {
    marginRight: 6,
  },
  confirmBtnTextActive: {
    color: '#17140F',
    fontWeight: '700',
    fontSize: 15,
  },
  timelineCard: {
    paddingBottom: 4,
    marginTop: -8
  },
  dayLabel: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: '600',
    paddingTop: 14,
    paddingBottom: 4,
  },
  dayLabelSpaced: {
    paddingTop: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  timelineLogged: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '600',
  },
  seeFullBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  seeFullText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1A1512',
    borderWidth: 1,
    borderColor: '#3A2E23',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalBody: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnNo: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3A2E23',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnNoText: {
    color: TEXT_SECONDARY,
    fontWeight: '600',
    fontSize: 15,
  },
  modalBtnYes: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnYesText: {
    color: '#17140F',
    fontWeight: '700',
    fontSize: 15,
  },
});