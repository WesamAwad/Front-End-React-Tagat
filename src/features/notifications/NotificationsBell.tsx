import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import type { AuthValidationErrorResponse, CustomerNotification } from "../../types/authTypes";
import { useAppSelector } from "../../store/hooks";
import { isCustomerSession } from "../auth/authRoles";
import {
  useGetCustomerNotificationsQuery,
  useMarkAllCustomerNotificationsReadMutation,
  useMarkCustomerNotificationReadMutation,
} from "../auth/authApi";

const EMPTY_NOTIFICATIONS: CustomerNotification[] = [];

type NotificationsBellProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

function formatNotificationTime(value: string) {
  if (!value) return "";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "الآن";
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} س`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `منذ ${diffDays} ي`;

  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function NotificationsBell({ isOpen, onToggle, onClose }: NotificationsBellProps) {
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const canUseNotifications = Boolean(token) && isCustomerSession(role);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error, refetch } = useGetCustomerNotificationsQuery(undefined, {
    skip: !canUseNotifications,
    pollingInterval: canUseNotifications ? 30000 : 0,
    refetchOnFocus: true,
  });
  const [markAsRead] = useMarkCustomerNotificationReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllCustomerNotificationsReadMutation();

  const notifications = data?.data ?? EMPTY_NOTIFICATIONS;
  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const errorMessage = (error as { data?: AuthValidationErrorResponse })?.data?.message;
  const isForbidden = (error as { status?: number })?.status === 403;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleToggle = () => {
    if (!canUseNotifications) {
      navigate("/login");
      return;
    }
    onToggle();
  };

  const handleNotificationClick = (notification: CustomerNotification) => {
    if (!notification.read_at) {
      void markAsRead(notification.id);
    }
  };

  const handleMarkAll = () => {
    if (!unreadCount || isMarkingAll) return;
    void markAllAsRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={unreadCount > 0 ? `الإشعارات (${unreadCount} غير مقروء)` : "الإشعارات"}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleToggle}
        className="relative inline-flex size-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary-light hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -inset-e-0.5 flex min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen && canUseNotifications ? (
        <div
          role="dialog"
          aria-label="الإشعارات"
          className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-primary/10 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-3">
            <h2 className="text-sm font-bold text-primary">الإشعارات</h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-secondary transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                {isMarkingAll ? "جاري التحديث..." : "تعليم الكل كمقروء"}
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500" role="status">
                جاري تحميل الإشعارات...
              </p>
            ) : isError ? (
              <div className="px-4 py-8 text-center" role="alert">
                <p className="text-sm text-red-700">{errorMessage || (isForbidden ? "الإشعارات متاحة لحسابات العملاء فقط." : "تعذر تحميل الإشعارات.")}</p>
                {!isForbidden ? (
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-3 text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    إعادة المحاولة
                  </button>
                ) : null}
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">لا توجد إشعارات حالياً</p>
            ) : (
              <ul>
                {notifications.map((notification) => {
                  const isUnread = !notification.read_at;
                  return (
                    <li key={notification.id} className="border-b border-primary/5 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full flex-col gap-1 px-4 py-3 text-start transition hover:bg-primary-light/50 ${isUnread ? "bg-primary-light/35" : "bg-white"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className={`text-sm ${isUnread ? "font-semibold text-primary" : "font-medium text-primary/80"}`}>{notification.title}</p>
                          {isUnread ? <span className="mt-1 size-2 shrink-0 rounded-full bg-secondary" aria-label="غير مقروء" /> : null}
                        </div>
                        {notification.message ? <p className="text-xs leading-relaxed text-gray-600">{notification.message}</p> : null}
                        {notification.service_name || notification.device_model_name ? (
                          <p className="text-xs text-primary/70">
                            {[notification.service_name, notification.device_model_name].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                        {notification.shop_name ? <p className="text-xs text-gray-500">{notification.shop_name}</p> : null}
                        <p className="text-[11px] text-gray-400">{formatNotificationTime(notification.created_at)}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
