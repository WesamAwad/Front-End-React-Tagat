import { Mail, MapPin, Phone } from "lucide-react";
import type { WorkshopDetails, WorkshopWorkingHourRow } from "./types";
import { WorkshopPublicMap } from "./WorkshopPublicMap";

type WorkshopLocationHoursTabProps = {
  workshop: WorkshopDetails;
};

/** Matches workshop profile week order (Sat–Thu), then Friday. */
const DAY_ORDER = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

const DAY_ALIASES: Record<string, (typeof DAY_ORDER)[number]> = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
  sun: "sunday",
  mon: "monday",
  tue: "tuesday",
  tues: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  thur: "thursday",
  thurs: "thursday",
  fri: "friday",
  sat: "saturday",
  الأحد: "sunday",
  الاحد: "sunday",
  الاثنين: "monday",
  الإثنين: "monday",
  الثلاثاء: "tuesday",
  الأربعاء: "wednesday",
  الاربعاء: "wednesday",
  الخميس: "thursday",
  الجمعة: "friday",
  السبت: "saturday",
};

function normalizeDayKey(day: string) {
  const trimmed = day.trim();
  const lower = trimmed.toLowerCase();
  return DAY_ALIASES[lower] ?? DAY_ALIASES[trimmed] ?? lower;
}

function formatClock(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;

  let hour = Number(match[1]);
  const minute = match[2];
  if (!Number.isFinite(hour)) return raw;

  const period = hour >= 12 ? "م" : "ص";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${period}`;
}

function formatWorkingRange(from: string, to: string) {
  if (!from && !to) return "مغلق";
  const start = formatClock(from);
  const end = formatClock(to);
  if (start && end) return `${start} – ${end}`;
  return start || end || "مغلق";
}

function buildDisplayHours(hours: WorkshopWorkingHourRow[]) {
  const jsDayIndex = new Date().getDay(); // 0 = Sunday
  const todayKey = (["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const)[jsDayIndex];
  const byDay = new Map<string, WorkshopWorkingHourRow>();

  for (const item of hours) {
    const key = normalizeDayKey(item.day);
    byDay.set(key, item);
  }

  const knownMatches = DAY_ORDER.filter((key) => byDay.has(key)).length;

  if (hours.length > 0 && knownMatches === 0) {
    return hours.map((item, index) => {
      const key = normalizeDayKey(item.day);
      return {
        key: `${key}-${index}`,
        label: DAY_LABELS[key as (typeof DAY_ORDER)[number]] ?? item.day,
        value: formatWorkingRange(item.from, item.to),
        isToday: key === todayKey,
      };
    });
  }

  return DAY_ORDER.map((key) => {
    const row = byDay.get(key);
    return {
      key,
      label: DAY_LABELS[key],
      value: row ? formatWorkingRange(row.from, row.to) : "مغلق",
      isToday: key === todayKey,
    };
  });
}

export function WorkshopLocationHoursTab({ workshop }: WorkshopLocationHoursTabProps) {
  const displayHours = buildDisplayHours(workshop.workingHours);
  const hasHoursFromApi = workshop.workingHours.length > 0;
  const contactItems = [
    {
      id: "phone",
      label: "الهاتف",
      value: workshop.phone || "غير متوفر",
      href: workshop.phone ? `tel:${workshop.phone.replace(/\s/g, "")}` : undefined,
      icon: Phone,
    },
    {
      id: "email",
      label: "البريد الإلكتروني",
      value: workshop.email || "غير متوفر",
      href: workshop.email ? `mailto:${workshop.email}` : undefined,
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-5">
      <WorkshopPublicMap latitude={workshop.latitude} longitude={workshop.longitude} shopName={workshop.name} />

      <div className="rounded-xl bg-[#f7f7f7] p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ffefe4]">
            <MapPin className="size-4 text-secondary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">العنوان التفصيلي</p>
            <p className="mt-1 text-sm text-[#555]">{workshop.detailedAddress || workshop.location}</p>
            {workshop.addressNote ? <p className="mt-1 text-sm text-[#888]">{workshop.addressNote}</p> : null}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-primary">ساعات العمل</h3>
        {!hasHoursFromApi ? (
          <p className="rounded-lg bg-[#fafafa] px-3 py-3 text-sm text-[#888]">لم يتم تحديد ساعات العمل بعد</p>
        ) : (
          <ul className="space-y-2">
            {displayHours.map((day) => (
              <li
                key={day.key}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${day.isToday ? "bg-[#fff4eb]" : "bg-[#fafafa]"}`}
              >
                <div className="flex items-center gap-2">
                  {day.isToday ? <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-white">اليوم</span> : null}
                  <span className="font-medium text-[#333]">{day.label}</span>
                </div>
                <span className={`shrink-0 ${day.value === "مغلق" ? "text-[#999]" : "text-[#555]"}`} dir="ltr">
                  {day.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const className = "rounded-xl bg-primary-light/50 p-3 transition hover:bg-primary-light";
          const body = (
            <>
              <p className="flex items-center gap-1.5 text-xs text-[#777]">
                <Icon className="size-3.5 text-secondary" aria-hidden="true" />
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium text-primary" dir="ltr">
                {item.value}
              </p>
            </>
          );

          if (item.href) {
            return (
              <a key={item.id} href={item.href} className={className}>
                {body}
              </a>
            );
          }

          return (
            <div key={item.id} className={className}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
