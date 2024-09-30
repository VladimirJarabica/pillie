export enum DoseInterval {
  ONE_DAY = 1,
  TWO_DAYS = 2,
  THREE_DAYS = 3,
  FOUR_DAYS = 4,
  FIVE_DAYS = 5,
  SIX_DAYS = 6,
  ONE_WEEK = 7,
  TWO_WEEKS = 14,
}

export type Pill = {
  id: string | "new";
  name: string;
  dose: number;
  doseInterval: DoseInterval;
  doses: number;
  dosesUpdated: Date;
  notifyDaysBefore: number;
  notificationId: string;
};
