import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    subtitle: "#687076",
    border: "#333434",
  },
  dark: {
    text: "#ECEDEE",
    background: "#17140F",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    subtitle: "#8C826D",
    border: "#3a3a3a",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    bold: 'Inter_700Bold',
    serif: 'System', // iOS default serif
    rounded: 'System', 
    mono: 'Courier',
  },
  android: {
    sans: 'Inter_400Regular',
    bold: 'Inter_700Bold',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter_400Regular, Inter, system-ui, -apple-system, sans-serif',
    bold: 'Inter_700Bold, Inter, system-ui, -apple-system, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    bold: 'Inter_700Bold',
  }
});

