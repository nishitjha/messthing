import { Colors } from "./theme";

export const globalStyles = {
  MainContainer: {
    flex: 1,
    padding: 32,
    backgroundColor: Colors.dark.background,
  },
  TitleContainer: {
    backgroundColor: Colors.dark.background,
    marginTop: 36,
  },
  CenteredContainer: {
    flex: 1,
    padding: 32,
    backgroundColor: Colors.dark.background,
    justifyContent: "center",
    alignItems: "center",
  },
  GreetingContainer: {
    gap: 8,
    marginTop: 8,
    backgroundColor: Colors.dark.background,
  },
};
