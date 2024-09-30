import { ThemedView } from "@/components/ThemedView";
import { Link, router, usePathname } from "expo-router";
import { useState } from "react";
import {
  Button,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../components/ThemedText";
import {
  getRemainingDays,
  getRemainingDoses,
  stringifyPill,
  usePills,
  useRefreshPills,
} from "../utils/pills";
import { DoseInterval } from "../utils/types";

// Color palette: https://coolors.co/palette/0a0908-22333b-eae0d5-c6ac8f-5e503f

export default function HomeScreen() {
  const allPills = usePills();
  const refreshAllPills = useRefreshPills();

  const [refreshing, setRefreshing] = useState(false);

  const pathname = usePathname();
  console.log("pathname", pathname);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refreshAllPills();
              setRefreshing(false);
            }}
          />
        }
      >
        {allPills.map((pill) => {
          const remainingDoses = Math.floor(getRemainingDoses(pill));
          const remainingDays = getRemainingDays(pill);

          return (
            <Pressable
              key={pill.id}
              style={({ pressed }) =>
                pressed ? styles.card : [styles.card, styles.shadowed]
              }
              onPress={() => {
                router.push({
                  pathname: "/pill",
                  params: { pill: pill.id },
                });
              }}
            >
              <ThemedText type="subtitle" style={styles.title}>
                {pill.name}
              </ThemedText>
              <View style={styles.tags}>
                <ThemedText
                  type="default"
                  style={[styles.tag, styles.shadowed]}
                >
                  {pill.dose}x za{" "}
                  {(() => {
                    switch (pill.doseInterval) {
                      case DoseInterval.ONE_DAY:
                        return "deň";
                      case DoseInterval.TWO_DAYS:
                        return "2 dni";
                      case DoseInterval.THREE_DAYS:
                        return "3 dni";
                      case DoseInterval.FOUR_DAYS:
                        return "4 dni";
                      case DoseInterval.FIVE_DAYS:
                        return "5 dní";
                      case DoseInterval.SIX_DAYS:
                        return "6 dní";
                      case DoseInterval.ONE_WEEK:
                        return "týždeň";
                      case DoseInterval.TWO_WEEKS:
                        return "2 týždne";
                    }
                  })()}
                </ThemedText>
                <ThemedText type="default" style={styles.tag}>
                  {Math.max(remainingDoses, 0)} tabliet
                </ThemedText>
                {remainingDays === 0 && (
                  <>
                    <ThemedText type="default" style={styles.tag}>
                      Liek došiel
                    </ThemedText>
                  </>
                )}
                {remainingDays > 0 && (
                  <ThemedText type="default" style={styles.tag}>
                    Dôjde za {remainingDays} dni
                  </ThemedText>
                )}
                {remainingDays < 0 && (
                  <ThemedText type="default" style={styles.tag}>
                    Došiel pred {Math.abs(remainingDays)} dňami
                  </ThemedText>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        style={({ pressed }) =>
          pressed ? styles.plus : [styles.plus, styles.shadowed]
        }
        onPress={() => {
          router.push({
            pathname: "/edit-pill",
            params: { editingPill: null },
          });
        }}
      >
        <ThemedText style={styles.plusText}>+</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eae0d5" },
  scrollContainer: {
    flex: 1,
  },
  shadowed: {
    shadowColor: "#8d99ae",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    opacity: 0.95,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 10,
    backgroundColor: "#c6ac8f",
  },
  title: {
    color: "#0a0908",
  },
  tags: {
    marginTop: 0,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#5e503f",
    color: "#EAE0D5",
    display: "flex",
    overflow: "hidden",
    borderRadius: 5,
    paddingVertical: 1,
    paddingHorizontal: 5,
    marginHorizontal: 3,
    marginVertical: 3,
  },
  editButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  plus: {
    position: "absolute",
    bottom: 60,
    width: 60,
    right: 20,
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: "#EAE0D5",
    borderWidth: 2,
    borderColor: "#5E503F",
  },
  plusText: {
    color: "#5E503F",
    lineHeight: 45,
    fontSize: 40,
  },
});
