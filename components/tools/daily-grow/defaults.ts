import type {
  Activity,
  PeriodTime,
  Profile,
  RewardTx,
  ScheduleItem,
} from "./types";

export const DEFAULT_PROFILES: Profile[] = [
  { id: "kid_1", name: "Alice", code: "AL" },
  { id: "kid_2", name: "Bob", code: "BO" },
];

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "act_1", kidId: "kid_1", title: "Morning Reading", preset: 0 },
  { id: "act_2", kidId: "kid_1", title: "English Practice", preset: 1 },
  { id: "act_3", kidId: "kid_1", title: "Phonics Literacy", preset: 2 },
  { id: "act_4", kidId: "kid_1", title: "Math Odyssey", preset: 3 },
  { id: "act_5", kidId: "kid_1", title: "Independent Bathing", preset: 4 },
  { id: "act_6", kidId: "kid_1", title: "Bedtime Story", preset: 5 },
  { id: "act_7", kidId: "kid_2", title: "Piano Practice", preset: 1 },
  { id: "act_8", kidId: "kid_2", title: "Outdoor Play", preset: 4 },
];

export const DEFAULT_REWARD_TRANSACTIONS: RewardTx[] = [
  {
    id: "tx_1",
    kidId: "kid_1",
    type: "earn",
    title: "Perfect Bonus",
    remark: "Week 24 all challenges completed",
    date: "2026-06-10",
    amount: 1,
  },
  {
    id: "tx_2",
    kidId: "kid_1",
    type: "earn",
    title: "Spotless Habit",
    remark: "Dedicated focus on bedtime reading",
    date: "2026-06-15",
    amount: 1,
  },
  {
    id: "tx_3",
    kidId: "kid_1",
    type: "consume",
    title: "Redemption",
    remark: "Redeemed weekend playground trip",
    date: "2026-06-16",
    amount: -1,
  },
];

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: "sch_1", kidId: "kid_1", day: 1, period: 1, subject: "English Reading", preset: 1 },
  { id: "sch_2", kidId: "kid_1", day: 1, period: 3, subject: "Math Geometry", preset: 3 },
  { id: "sch_3", kidId: "kid_1", day: 2, period: 2, subject: "Phonics Literacy", preset: 2 },
  { id: "sch_4", kidId: "kid_1", day: 2, period: 4, subject: "Science Labs", preset: 0 },
  { id: "sch_5", kidId: "kid_1", day: 3, period: 1, subject: "Creative Writing", preset: 4 },
  { id: "sch_6", kidId: "kid_1", day: 3, period: 5, subject: "Piano Session", preset: 1 },
  { id: "sch_7", kidId: "kid_1", day: 4, period: 2, subject: "Speech Delivery", preset: 2 },
  { id: "sch_8", kidId: "kid_1", day: 4, period: 4, subject: "Swimming Drills", preset: 3 },
  { id: "sch_9", kidId: "kid_1", day: 5, period: 1, subject: "Olympiad Math", preset: 0 },
  { id: "sch_10", kidId: "kid_1", day: 5, period: 3, subject: "Language Phonetics", preset: 5 },
  { id: "sch_11", kidId: "kid_1", day: 6, period: 2, subject: "Museum Guide", preset: 2 },
  { id: "sch_12", kidId: "kid_1", day: 7, period: 4, subject: "Family Cinema", preset: 1 },
  { id: "sch_13", kidId: "kid_2", day: 1, period: 2, subject: "Art Studio", preset: 4 },
  { id: "sch_14", kidId: "kid_2", day: 3, period: 3, subject: "Soccer Training", preset: 0 },
  { id: "sch_15", kidId: "kid_2", day: 5, period: 2, subject: "Coding Basics", preset: 3 },
];

export const DEFAULT_PERIOD_TIMES: PeriodTime[] = [
  { num: 1, name: "Period 1", range: "07:30 - 08:15" },
  { num: 2, name: "Period 2", range: "08:25 - 09:10" },
  { num: 3, name: "Period 3", range: "09:20 - 10:05" },
  { num: 4, name: "Period 4", range: "10:15 - 11:00" },
  { num: 5, name: "Period 5", range: "11:10 - 11:55" },
  { num: 6, name: "Period 6", range: "13:30 - 14:15" },
  { num: 7, name: "Period 7", range: "14:25 - 15:10" },
  { num: 8, name: "Period 8", range: "15:20 - 16:05" },
  { num: 9, name: "Period 9", range: "16:15 - 17:00" },
  { num: 10, name: "Period 10", range: "17:10 - 17:55" },
  { num: 11, name: "Period 11", range: "18:30 - 19:15" },
  { num: 12, name: "Period 12", range: "19:25 - 20:10" },
  { num: 13, name: "Period 13", range: "20:20 - 21:05" },
];

/** Friday (5) and Saturday (6) as base rest days — matches HTML defaults */
export const DEFAULT_REST_DAYS: number[] = [5, 6];

export const DEFAULT_ACTIVE_KID_ID = "kid_1";

export const DEFAULT_LANG = "en" as const;
