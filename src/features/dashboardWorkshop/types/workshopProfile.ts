export type WorkshopProfileFormValues = {
  shop_name: string;
  description: string;
  country_id: string;
  city_id: string;
  district: string;
  street: string;
  latitude: string;
  longitude: string;
};

export type WorkingDayKey = "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday";

export type WorkingDayHours = {
  enabled: boolean;
  from: string;
  to: string;
};

export type WorkingHoursState = Record<WorkingDayKey, WorkingDayHours>;

export const workingDays: Array<{ key: WorkingDayKey; label: string }> = [
  { key: "saturday", label: "السبت" },
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الإثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
];

export const emptyWorkingHours: WorkingHoursState = {
  saturday: { enabled: false, from: "", to: "" },
  sunday: { enabled: false, from: "", to: "" },
  monday: { enabled: false, from: "", to: "" },
  tuesday: { enabled: false, from: "", to: "" },
  wednesday: { enabled: false, from: "", to: "" },
  thursday: { enabled: false, from: "", to: "" },
};

export const emptyWorkshopProfileForm: WorkshopProfileFormValues = {
  shop_name: "",
  description: "",
  country_id: "",
  city_id: "",
  district: "",
  street: "",
  latitude: "",
  longitude: "",
};

export function buildWorkingHoursPayload(workingHours: WorkingHoursState) {
  return workingDays
    .filter(({ key }) => workingHours[key].enabled)
    .map(({ key }) => ({
      day: key,
      from: workingHours[key].from,
      to: workingHours[key].to,
    }));
}

const workingDayKeySet = new Set<string>(workingDays.map(({ key }) => key));

function toWorkingDayKey(day: string): WorkingDayKey | null {
  const normalized = day.trim().toLowerCase();
  if (workingDayKeySet.has(normalized)) return normalized as WorkingDayKey;

  const byLabel = workingDays.find(({ label }) => label === day.trim());
  return byLabel?.key ?? null;
}

export function workingHoursFromPayload(items: Array<{ day: string; from: string; to: string }>): WorkingHoursState {
  const next: WorkingHoursState = { ...emptyWorkingHours };

  for (const item of items) {
    const key = toWorkingDayKey(item.day);
    if (!key) continue;
    next[key] = {
      enabled: true,
      from: item.from,
      to: item.to,
    };
  }

  return next;
}
