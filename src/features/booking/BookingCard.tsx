import calendarIcon from "../../assets/booking/calendar.svg";
import clipboardIcon from "../../assets/booking/clipboard.svg";
import wrenchIcon from "../../assets/booking/wrench.svg";
import { bookingStatusMeta, type BookingStatus } from "./bookingStatus";

export type BookingCardData = {
  id: string;
  workshopName: string;
  device: string;
  service: string;
  appointment: string;
  status: BookingStatus | null;
  statusLabel: string;
};

type BookingCardProps = {
  booking: BookingCardData;
};

const fallbackStatus = {
  badgeClass: "bg-gray-500",
  barClass: "bg-gray-200",
};

export function BookingCard({ booking }: BookingCardProps) {
  const status = booking.status ? bookingStatusMeta[booking.status] : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
      <div className={`h-1 w-full ${status?.barClass ?? fallbackStatus.barClass}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-12.25 shrink-0 items-center justify-center rounded-lg bg-[#ffefe4]">
              <img src={wrenchIcon} alt="" width={22} height={22} />
            </div>
            <div className="min-w-0 text-start">
              <h2 className="text-2xl font-bold leading-normal text-[#1a1a1a]">{booking.workshopName || "—"}</h2>
              <p className="mt-1 text-sm text-[#777]">{booking.device || "—"}</p>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${status?.badgeClass ?? fallbackStatus.badgeClass}`}>
            {status?.label ?? (booking.statusLabel || "—")}
          </span>
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#444]">
          <img src={clipboardIcon} alt="" width={14} height={14} />
          {booking.service || "—"}
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[#888]">
          <img src={calendarIcon} alt="" width={14} height={14} />
          {booking.appointment}
        </p>

      </div>
    </article>
  );
}
