import { ThemedView } from "@/components/ThemedView";
import { router, usePathname } from "expo-router";
import { useState } from "react";
import {
  Button,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../components/ThemedText";
import { stringifyPill, usePills, useRefreshPills } from "../utils/pills";

export type Pill = {
  id: string | "new";
  name: string;
  dailyDose: number;
  amount: number;
  amountUpdated: Date;
  notifyDaysBefore: number;
  notificationId: string;
};

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
        <Button
          title="Pridať liek"
          onPress={() => {
            router.push({
              pathname: "/edit-pill",
              params: { editingPill: null },
            });
          }}
          color="#22333b"
        />
        {allPills.map((pill) => (
          <ThemedView key={pill.id} style={[styles.card, styles.shadowed]}>
            <ThemedText type="subtitle" style={styles.title}>
              {pill.name}
            </ThemedText>
            <View style={styles.tags}>
              <ThemedText type="default" style={[styles.tag, styles.shadowed]}>
                {pill.dailyDose}x denne
              </ThemedText>
              <ThemedText type="default" style={styles.tag}>
                {Math.max(pill.amount, 0)} zvyšných tabliet
              </ThemedText>
              {pill.amount === 0 && (
                <>
                  <ThemedText type="default" style={styles.tag}>
                    Liek došiel
                  </ThemedText>
                </>
              )}
              {pill.amount > 0 && (
                <ThemedText type="default" style={styles.tag}>
                  Dojde za {Math.floor(pill.amount / pill.dailyDose)} dni
                </ThemedText>
              )}
              {pill.amount < 0 && (
                <ThemedText type="default" style={styles.tag}>
                  Došiel pred{" "}
                  {Math.abs(Math.floor(pill.amount / pill.dailyDose))} dňami
                </ThemedText>
              )}
            </View>
            <Button
              title="Upraviť"
              color="#22333b"
              onPress={() => {
                router.push({
                  pathname: "/edit-pill",
                  params: { pill: stringifyPill(pill) },
                });
              }}
            />
          </ThemedView>
        ))}
      </ScrollView>
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
    marginTop: 20,
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
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginHorizontal: 5,
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
});
