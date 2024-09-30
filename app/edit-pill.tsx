import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { useState } from "react";
import { Pill } from ".";
import { ThemedInput } from "../components/ThemedInput";
import { ThemedNumberInput } from "../components/ThemedNumberInput";
import { useNotifications } from "../components/useNotifications";
import { ALL_PILLS_KEY, DAY_SECONDS, getPillKey } from "../utils/constants";
import {
  parsePill,
  stringifyPill,
  usePills,
  useRefreshPills,
} from "../utils/pills";

export default function EditPill() {
  const item = useLocalSearchParams();
  const { schedulePushNotification, cancelScheduledNotification } =
    useNotifications();
  const router = useRouter();
  const allPills = usePills();
  const refreshPills = useRefreshPills();

  const [editingPill, setEditingPill] = useState<Pill>(
    item.pill
      ? parsePill(item.pill as string)
      : {
          id: "new",
          name: "",
          dailyDose: 1,
          amount: 10,
          amountUpdated: new Date(),
          notificationId: "",
          notifyDaysBefore: 2,
        }
  );

  const isNew = editingPill.id === "new";

  const savePill = async () => {
    if (!editingPill || editingPill.dailyDose === null) {
      return;
    }

    const isNew = editingPill.id === "new";

    const id = isNew ? randomUUID() : editingPill.id;

    const daysToNotification =
      editingPill.amount / editingPill.dailyDose - editingPill.notifyDaysBefore;
    const notificationId = await schedulePushNotification(
      {
        title: `Liek ${editingPill.name} dochádza`,
        body: `Liek ${editingPill.name} dôjde za ${editingPill.notifyDaysBefore} dní`,
        data: { data: "goes here", test: { test1: "more data" } },
      },
      daysToNotification * DAY_SECONDS
    );

    if (isNew) {
      await AsyncStorage.setItem(
        ALL_PILLS_KEY,
        JSON.stringify([...allPills.map((p) => p.id), id])
      );
    }
    await AsyncStorage.setItem(
      getPillKey(id),
      stringifyPill({
        ...editingPill,
        notificationId,
        amountUpdated: new Date(),
        id,
      })
    );

    await refreshPills();
    router.back();
  };

  const removePill = async () => {
    if (!editingPill) {
      return;
    }
    const newPills = allPills
      .map((p) => p.id)
      .filter((id) => id !== editingPill.id);
    await AsyncStorage.setItem(ALL_PILLS_KEY, JSON.stringify(newPills));
    await cancelScheduledNotification(editingPill.notificationId);
    await AsyncStorage.removeItem(getPillKey(editingPill.id));
    await refreshPills();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isNew ? "Nový liek" : "Upraviť liek",
          headerBackTitle: "Späť",
          headerTintColor: "#22333B",
          headerStyle: { backgroundColor: "#EAE0D5" },
        }}
      />
      <ThemedView style={styles.container}>
        <ThemedInput
          placeholder="Názov lieku"
          style={styles.input}
          onChangeText={(t) => {
            setEditingPill((p) => (p ? { ...p, name: t } : p));
          }}
          value={editingPill.name}
        />
        <ThemedText style={styles.label}>Denná dávka</ThemedText>
        <ThemedNumberInput
          placeholder="Denná dávka"
          style={styles.input}
          onChangeText={(t) => {
            setEditingPill((p) => (p ? { ...p, dailyDose: parseInt(t) } : p));
          }}
          value={editingPill.dailyDose.toString()}
        />
        <ThemedText style={styles.label}>Množstvo</ThemedText>
        <ThemedNumberInput
          placeholder="Množstvo"
          style={styles.input}
          onChangeText={(t) => {
            setEditingPill((p) => (p ? { ...p, amount: parseInt(t) } : p));
          }}
          value={Math.max(editingPill.amount, 0).toString()}
        />
        <ThemedText style={styles.label}>
          Pošli oznámenie X dní než liek dojde
        </ThemedText>
        <ThemedNumberInput
          placeholder="Oznámenie pred dojdenim"
          style={styles.input}
          onChangeText={(t) => {
            setEditingPill((p) =>
              p ? { ...p, notifyDaysBefore: parseInt(t) } : p
            );
          }}
          value={editingPill.notifyDaysBefore.toString()}
        />
        <Button
          title="Uložiť"
          color="#0A0908"
          onPress={() => {
            savePill();
          }}
        />
        {editingPill.id !== "new" && (
          <Button
            title="Odstrániť"
            color="#22333B"
            onPress={() => {
              removePill();
            }}
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: "#EAE0D5",
    padding: 20,
  },
  input: {
    // flex: 1,
    borderBottomColor: "#5E503F",
    borderBottomWidth: 1,
    color: "#5E503F",
    marginVertical: 5,
    height: 40,
    fontSize: 20,
  },
  label: { fontSize: 20, color: "#5E503F", marginTop: 15 },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
