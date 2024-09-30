import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, StyleSheet, View } from "react-native";
import { useNotifications } from "../components/useNotifications";
import { ALL_PILLS_KEY, getPillKey } from "../utils/constants";
import { stringifyPill, usePills, useRefreshPills } from "../utils/pills";

export default function PillDetail() {
  const item = useLocalSearchParams();
  const allPills = usePills();
  const router = useRouter();
  const pill = allPills.find((p) => p.id === item.pill);
  const { schedulePushNotification, cancelScheduledNotification } =
    useNotifications();
  const refreshPills = useRefreshPills();

  if (!pill) {
    return null;
  }

  const removePill = async () => {
    const newPills = allPills.map((p) => p.id).filter((id) => id !== pill.id);
    await AsyncStorage.setItem(ALL_PILLS_KEY, JSON.stringify(newPills));
    await cancelScheduledNotification(pill.notificationId);
    await AsyncStorage.removeItem(getPillKey(pill.id));
    await refreshPills();
    router.back();
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: pill.name,
          headerBackTitle: "Späť",
          headerTintColor: "#22333B",
          headerStyle: { backgroundColor: "#EAE0D5" },
          headerRight: () => (
            <Button
              color="#22333B"
              title="Upraviť"
              onPress={() => {
                router.push({
                  pathname: "/edit-pill",
                  params: { pill: stringifyPill(pill) },
                });
              }}
            />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <Button
          title="Odstrániť"
          color="#22333b"
          onPress={() => {
            removePill();
          }}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <ThemedText>Liek: </ThemedText>
          <ThemedText>{pill.name}</ThemedText>
        </View>
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
