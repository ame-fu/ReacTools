export interface Profile {
  id: string;
  name: string;
  code: string;
}

export interface Activity {
  id: string;
  kidId: string;
  title: string;
  preset: number;
}

export interface Log {
  id: string;
  kidId: string;
  actId: string;
  date: string;
}

export type RewardTxType = "earn" | "consume";

export interface RewardTx {
  id: string;
  kidId: string;
  type: RewardTxType;
  title: string;
  remark: string;
  date: string;
  amount: number;
}

export interface ScheduleItem {
  id: string;
  kidId: string;
  day: number;
  period: number;
  subject: string;
  preset: number;
}

export interface PeriodTime {
  num: number;
  name: string;
  range: string;
}

export type TabId = "checkin" | "badges" | "schedule" | "admin";

export type LangCode = "en" | "zh";

export interface DailyGrowState {
  tab: TabId;
  profiles: Profile[];
  activities: Activity[];
  logs: Log[];
  rewards: RewardTx[];
  schedule: ScheduleItem[];
  periodTimes: PeriodTime[];
  restDays: number[];
  customRestDates: string[];
  customWorkDates: string[];
  activeKidId: string;
  activeScheduleMobileDay: number;
  batchEditMode: boolean;
  selectedSlots: string[];
  lang: LangCode;
}

export type ModalFieldType = "text" | "number" | "select";

export interface ModalFieldOption {
  value: string;
  label: string;
}

export interface ModalField {
  id: string;
  type: ModalFieldType;
  placeholder?: string;
  label?: string;
  defaultValue?: string | number;
  options?: ModalFieldOption[];
}

export interface DailyGrowBackupData {
  profiles: Profile[];
  activities: Activity[];
  logs: Log[];
  rewards: RewardTx[];
  schedule: ScheduleItem[];
  periodTimes: PeriodTime[];
  restDays: number[];
  customRestDates: string[];
  customWorkDates: string[];
  lang: LangCode;
}
