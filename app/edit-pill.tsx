import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { randomUUID } from "expo-crypto";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ThemedInput } from "../components/ThemedInput";
import { ThemedNumberInput } from "../components/ThemedNumberInput";
import { useNotifications } from "../components/useNotifications";
import { ALL_PILLS_KEY, DAY_SECONDS, getPillKey } from "../utils/constants";
import {
  getRemainingDays,
  parsePill,
  stringifyPill,
  usePills,
  useRefreshPills,
} from "../utils/pills";
import { DoseInterval, Pill } from "../utils/types";

export default function EditPill() {
  const item = useLocalSearchParams();
  const { schedulePushNotification, cancelScheduledNotification } =
    useNotifications();
  const router = useRouter();
  const allPills = usePills();
  const refreshPills = useRefreshPills();

  const [editingPill, setEditingPill] = useState<Pill>(
    item.pill
      ? (parsePill(item.pill as string) as Pill)
      : {
          id: "new",
          name: "",
          dose: 1,
          doseInterval: DoseInterval.ONE_DAY,
          doses: 10,
          dosesUpdated: new Date(),
          notificationId: "",
          notifyDaysBefore: 2,
        }
  );

  const isNew = editingPill.id === "new";

  const savePill = async () => {
    if (!editingPill) {
      return;
    }

    const isNew = editingPill.id === "new";

    const id = isNew ? randomUUID() : editingPill.id;

    const daysToNotification =
      getRemainingDays(editingPill) - editingPill.notifyDaysBefore;
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
        dosesUpdated: new Date(),
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
          headerRight: () => (
            <Button
              color="#22333B"
              title="Uložiť"
              onPress={() => {
                savePill();
              }}
            />
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.inner}>
            <ThemedInput
              placeholder="Názov lieku"
              defaultValue={editingPill.name}
              style={styles.input}
              onChangeText={(t) => {
                setEditingPill((p) => ({ ...p, name: t }));
              }}
              // value={editingPill.name}
            />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Picker
                itemStyle={{ height: 150 }}
                style={{ flex: 1, fontSize: 10 }}
                selectedValue={editingPill.dose}
                onValueChange={(itemValue) => {
                  setEditingPill((p) => ({ ...p, dose: itemValue }));
                }}
              >
                {new Array(100).fill(0).map((_, i) => (
                  <Picker.Item
                    key={i}
                    label={(i + 1).toString()}
                    style={{ fontSize: 10 }}
                    value={i + 1}
                  />
                ))}
              </Picker>
              <Text style={{ fontSize: 20 }}>krát za</Text>
              <Picker
                style={{ flex: 1 }}
                itemStyle={{ height: 150 }}
                selectedValue={editingPill.doseInterval}
                onValueChange={(itemValue) => {
                  setEditingPill((p) => ({ ...p, doseInterval: itemValue }));
                }}
              >
                <Picker.Item label="deň" value={DoseInterval.ONE_DAY} />
                <Picker.Item label="2 dni" value={DoseInterval.TWO_DAYS} />
                <Picker.Item label="3 dni" value={DoseInterval.THREE_DAYS} />
                <Picker.Item label="4 dni" value={DoseInterval.FOUR_DAYS} />
                <Picker.Item label="5 dní" value={DoseInterval.FIVE_DAYS} />
                <Picker.Item label="6 dní" value={DoseInterval.SIX_DAYS} />
                <Picker.Item label="týždeň" value={DoseInterval.ONE_WEEK} />
                <Picker.Item label="2 týždne" value={DoseInterval.TWO_WEEKS} />
              </Picker>
            </View>
            <ThemedText>Aktuálne množstvo tabliet</ThemedText>
            <ThemedNumberInput
              placeholder="Množstvo"
              style={styles.input}
              onChangeText={(t) => {
                setEditingPill((p) => (p ? { ...p, doses: parseInt(t) } : p));
              }}
              value={Math.max(editingPill.doses, 0).toString()}
            />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>Oznám</Text>
              <Picker
                style={{ flex: 1 }}
                mode="dropdown"
                selectedValue={editingPill.notifyDaysBefore}
                onValueChange={(itemValue) => {
                  setEditingPill((p) => ({
                    ...p,
                    notifyDaysBefore: itemValue,
                  }));
                }}
              >
                {new Array(100).fill(0).map((_, i) => (
                  <Picker.Item
                    key={i}
                    label={(i + 1).toString()}
                    value={i + 1}
                  />
                ))}
              </Picker>
              <Text style={{ fontSize: 20 }}>dni pred minutím</Text>
            </View>

            {editingPill.id !== "new" && (
              <Button
                title="Odstrániť"
                color="#22333B"
                onPress={() => {
                  removePill();
                }}
              />
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );

  // return (
  //   <>
  //     <Stack.Screen
  //       options={{
  //         title: isNew ? "Nový liek" : "Upraviť liek",
  //         headerBackTitle: "Späť",
  //         headerTintColor: "#22333B",
  //         headerStyle: { backgroundColor: "#EAE0D5" },
  //       }}
  //     />
  //     <KeyboardAvoidingView
  //       style={styles.container}
  //       behavior={Platform.OS === "ios" ? "padding" : "position"}
  //     >
  //       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  //         <View style={styles.inner}>
  //           <ThemedInput
  //             placeholder="Názov lieku"
  //             style={styles.input}
  //             onChangeText={(t) => {
  //               setEditingPill((p) => ({ ...p, name: t }));
  //             }}
  //             value={editingPill.name}
  //           />
  //           <Text style={styles.label}>Dávka</Text>
  //           <View
  //             style={{
  //               display: "flex",
  //               flexDirection: "row",
  //               alignItems: "center",
  //             }}
  //           >
  //             <Picker
  //               style={{ flex: 1 }}
  //               selectedValue={editingPill.dose}
  //               onValueChange={(itemValue) => {
  //                 setEditingPill((p) => ({ ...p, dose: itemValue }));
  //               }}
  //             >
  //               {new Array(100).fill(0).map((_, i) => (
  //                 <Picker.Item
  //                   key={i}
  //                   label={(i + 1).toString()}
  //                   value={i + 1}
  //                 />
  //               ))}
  //             </Picker>
  //             <Text style={{ fontSize: 20 }}>krát za</Text>
  //             <Picker
  //               style={{ flex: 1 }}
  //               selectedValue={editingPill.doseInterval}
  //               onValueChange={(itemValue) => {
  //                 setEditingPill((p) => ({ ...p, doseInterval: itemValue }));
  //               }}
  //             >
  //               <Picker.Item label="deň" value={DoseInterval.ONE_DAY} />
  //               <Picker.Item label="2 dni" value={DoseInterval.TWO_DAYS} />
  //               <Picker.Item label="3 dni" value={DoseInterval.THREE_DAYS} />
  //               <Picker.Item label="4 dni" value={DoseInterval.FOUR_DAYS} />
  //               <Picker.Item label="5 dní" value={DoseInterval.FIVE_DAYS} />
  //               <Picker.Item label="6 dní" value={DoseInterval.SIX_DAYS} />
  //               <Picker.Item label="týždeň" value={DoseInterval.ONE_WEEK} />
  //               <Picker.Item label="2 týždne" value={DoseInterval.TWO_WEEKS} />
  //             </Picker>
  //           </View>
  //           <ThemedText style={styles.label}>Množstvo</ThemedText>
  //           <ThemedNumberInput
  //             placeholder="Množstvo"
  //             style={styles.input}
  //             onChangeText={(t) => {
  //               setEditingPill((p) => (p ? { ...p, doses: parseInt(t) } : p));
  //             }}
  //             value={Math.max(editingPill.doses, 0).toString()}
  //           />
  //           <View
  //             style={{
  //               display: "flex",
  //               flexDirection: "row",
  //               alignItems: "center",
  //             }}
  //           >
  //             <Text style={{ fontSize: 20 }}>Oznámenie</Text>
  //             <Picker
  //               style={{ flex: 1 }}
  //               selectedValue={editingPill.dose}
  //               onValueChange={(itemValue) => {
  //                 setEditingPill((p) => ({ ...p, dose: itemValue }));
  //               }}
  //             >
  //               {new Array(100).fill(0).map((_, i) => (
  //                 <Picker.Item
  //                   key={i}
  //                   label={(i + 1).toString()}
  //                   value={i + 1}
  //                 />
  //               ))}
  //             </Picker>
  //             <Text style={{ fontSize: 20 }}>dni pred minutím lieku</Text>
  //           </View>
  //           {/* <ThemedText style={styles.label}>
  //             Pošli oznámenie X dní než liek dojde
  //           </ThemedText>
  //           <ThemedNumberInput
  //             placeholder="Oznámenie pred dojdenim"
  //             style={styles.input}
  //             onChangeText={(t) => {
  //               setEditingPill((p) =>
  //                 p ? { ...p, notifyDaysBefore: parseInt(t) } : p
  //               );
  //             }}
  //             value={editingPill.notifyDaysBefore.toString()}
  //           /> */}
  //           <Button
  //             title="Uložiť"
  //             color="#0A0908"
  //             onPress={() => {
  //               savePill();
  //             }}
  //           />
  //           {editingPill.id !== "new" && (
  //             <Button
  //               title="Odstrániť"
  //               color="#22333B"
  //               onPress={() => {
  //                 removePill();
  //               }}
  //             />
  //           )}
  //         </View>
  //       </TouchableWithoutFeedback>
  //     </KeyboardAvoidingView>
  //   </>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 24,
    flex: 1,
    paddingBottom: 500,
    backgroundColor: "#EAE0D5",
  },
  input: {
    flex: 1,
    borderBottomColor: "#5E503F",
    borderBottomWidth: 1,
    color: "#5E503F",
    marginVertical: 5,
    height: 40,
    fontSize: 20,
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: "#000000",
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: "white",
    marginTop: 12,
  },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   inner: {
//     flex: 1,
//     alignItems: "stretch",
//     justifyContent: "flex-start",
//     padding: 20,
//     backgroundColor: "#EAE0D5",
//   },
//   input: {
//     // flex: 1,
//     borderBottomColor: "#5E503F",
//     borderBottomWidth: 1,
//     color: "#5E503F",
//     marginVertical: 5,
//     height: 40,
//     fontSize: 20,
//   },
//   label: { fontSize: 20, color: "#5E503F", marginTop: 15 },
//   link: {
//     marginTop: 15,
//     paddingVertical: 15,
//   },
// });
