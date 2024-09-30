import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pill } from "../app";
import { ALL_PILLS_KEY, DAY_SECONDS, getPillKey } from "./constants";
import { createContext, useContext, useEffect, useState } from "react";

export const stringifyPill = (pill: Pill) => JSON.stringify(pill);

export const parsePill = (pill: string) => JSON.parse(pill) as Pill;

export const getAllPills = async () => {
  const value = await AsyncStorage.getItem(ALL_PILLS_KEY);
  const parsed = JSON.parse(value ?? "[]") as string[];
  const all = await Promise.all(
    parsed.map(async (id) => {
      const pill = await AsyncStorage.getItem(getPillKey(id));
      if (!pill) {
        return null;
      }
      const parsed = parsePill(pill);
      if (parsed.dailyDose === null) {
        return null;
      }
      const amountUpdated = new Date(parsed.amountUpdated);
      const daysPassed = Math.floor(
        (Date.now() - amountUpdated.getTime()) / (DAY_SECONDS * 1000)
      );
      console.log("daysPassed", daysPassed, {
        now: Date.now(),
        amountUpdated: amountUpdated.getTime(),
      });
      const remainingAmount = Math.floor(
        parsed.amount - parsed.dailyDose * daysPassed
      );
      return {
        ...parsed,
        amount: remainingAmount, //Math.max(remainingAmount, 0),
        amountUpdated,
      };
    })
  );

  return all.filter(Boolean) as Pill[];
};

// export const useAllPills = () => {
//   const [allPills, setAllPills] = useState<Pill[]>([]);

//   const refetchAllPills = async () => {
//     setAllPills(await getAllPills());
//   };

//   useEffect(() => {
//     refetchAllPills();
//   }, []);

//   return { allPills, refetch: refetchAllPills };
// };

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
