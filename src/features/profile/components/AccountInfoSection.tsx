import calendarIcon from "../../../assets/profile/calendar.svg";
import trashIcon from "../../../assets/profile/trash.svg";
import { ProfileSection } from "./ProfileSection";

const createdAtFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatCreatedAt(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : createdAtFormatter.format(date);
}

type AccountInfoSectionProps = {
  userId: string;
  createdAt: string | null;
  onDeleteClick: () => void;
};

export function AccountInfoSection({ userId, createdAt, onDeleteClick }: AccountInfoSectionProps) {
  const items = [
    { label: "تاريخ إنشاء الحساب", value: formatCreatedAt(createdAt) },
    // Frozen accounts are rejected by the API (403), so anyone who reaches this page is active.
    { label: "حالة النشاط", value: "نشط" },
    { label: "معرف المستخدم", value: userId ? `#${userId}` : "—" },
  ];

  return (
    <ProfileSection title="معلومات الحساب" className="pb-10">
      <dl className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="flex items-center gap-2 text-sm font-medium text-primary">
              <img src={calendarIcon} alt="" width={18} height={18} className="shrink-0" />
              {item.label}
            </dt>
            <dd className="mt-2 text-sm text-black">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-col gap-5 rounded-lg bg-[#fdd9d7] p-5 sm:min-h-27.75 sm:flex-row sm:items-center sm:justify-between sm:pe-6">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-[#f44336]">
            <img src={trashIcon} alt="" width="25.4074" height="24" className="shrink-0" />
            حذف الحساب
          </h3>
          <p className="mt-3 text-xs text-black">سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن التراجع عن هذا الإجراء</p>
        </div>

        <button type="button" onClick={onDeleteClick} className="h-12 w-full shrink-0 rounded-3xl bg-[#f44336] px-7 text-base font-medium text-white transition hover:bg-[#e53935] sm:w-48">
          حذف الحساب
        </button>
      </div>
    </ProfileSection>
  );
}
