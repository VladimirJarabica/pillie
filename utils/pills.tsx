import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ALL_PILLS_KEY, DAY_SECONDS, getPillKey } from "./constants";
import { DoseInterval, Pill } from "./types";

export const stringifyPill = (pill: Pill) => JSON.stringify(pill);

export const parsePill = (pill: string) => {
  try {
    const parsed = JSON.parse(pill) as Pill;
    return {
      ...parsed,
      dosesUpdated: new Date(parsed.dosesUpdated),
      doseInterval: Number(parsed.doseInterval) as DoseInterval,
    };
  } catch (e) {
    return null;
  }
};

export const getAllPills = async () => {
  const value = await AsyncStorage.getItem(ALL_PILLS_KEY);
  const parsed = JSON.parse(value ?? "[]") as string[];
  const all = await Promise.all(
    parsed.map<Promise<Pill | null>>(async (id) => {
      const pill = await AsyncStorage.getItem(getPillKey(id));
      if (!pill) {
        return null;
      }
      const parsed = parsePill(pill);
      if (!parsed) {
        return null;
      }
      parsed.dosesUpdated = new Date(parsed.dosesUpdated);
      return parsed;
    })
  );

  return all.filter(Boolean) as Pill[];
};

const getPassedDays = (pill: Pill) => {
  return Math.floor(
    (Date.now() - pill.dosesUpdated.getTime()) / (DAY_SECONDS * 1000)
  );
};

const getDailyDose = (pill: Pill) => pill.dose / pill.doseInterval;

export const getRemainingDoses = (pill: Pill) => {
  const daysPassed = getPassedDays(pill);
  const dailyDose = getDailyDose(pill);

  const consumedDoses = dailyDose * daysPassed;

  return pill.doses - consumedDoses;
};
export const getRemainingDays = (pill: Pill) => {
  const dailyDose = getDailyDose(pill);

  const remainingDoses = getRemainingDoses(pill);

  return Math.ceil(remainingDoses / dailyDose);
};

type PillsContext = { pills: Pill[]; refresh: () => Promise<void> };
const pillsContext = createContext<PillsContext>({
  pills: [],
  refresh: () => Promise.resolve(),
});

export const PillsProvider = ({ children }: { children: React.ReactNode }) => {
  const [allPills, setAllPills] = useState<Pill[]>([]);

  const refetchAllPills = async () => {
    setAllPills(await getAllPills());
  };

  useEffect(() => {
    refetchAllPills();
  }, []);

  return (
    <pillsContext.Provider
      value={{ pills: allPills, refresh: refetchAllPills }}
    >
      {children}
    </pillsContext.Provider>
  );
};

export const usePills = () => useContext(pillsContext).pills;
export const useRefreshPills = () => useContext(pillsContext).refresh;
