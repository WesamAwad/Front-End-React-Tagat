import { useEffect, useId, useState, type FormEvent } from "react";
import { Eye, Reply, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { isRichTextEmpty } from "../../../components/richText";
import SuccessToast from "../../../components/SuccessToast";
import type { AuthValidationErrorResponse, ContactMessage } from "../../../types/authTypes";
import { useDeleteContactMessageMutation, useGetAllContactMessagesQuery, useReplyContactMessageMutation } from "../../auth/authApi";

const EMPTY_MESSAGES: ContactMessage[] = [];

function formatContactStatus(status: string) {
  const key = status.trim().toLowerCase();
  if (key === "replied") return "تم الرد";
  if (key === "pending") return "بانتظار الرد";
  return status.trim() || "—";
}

function contactStatusClass(status: string) {
  const key = status.trim().toLowerCase();
  if (key === "replied") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (key === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}

function formatMessageDate(date: string) {
  if (!date) return "—";
  const parsed = new Date(date.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function useDialogLock(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);
}

function MessageDetailsDialog({
  message,
  open,
  onClose,
}: {
  message: ContactMessage | null;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  useDialogLock(open, onClose);

  if (!open || !message) return null;

  const rows = [
    { label: "الاسم كامل", value: message.fullName },
    { label: "البريد الإلكتروني", value: message.email },
    { label: "الموضوع", value: message.subject },
    { label: "الرسالة", value: message.message },
    { label: "التاريخ", value: formatMessageDate(message.date) },
    { label: "الحالة", value: formatContactStatus(message.status) },
    ...(message.adminReply
      ? [
          { label: "رد الأدمن", value: message.adminReply, html: true },
          { label: "تاريخ الرد", value: formatMessageDate(message.repliedAt ?? message.date) },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق تفاصيل الرسالة" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              تفاصيل الرسالة
            </h2>
            <p className="mt-1 text-sm text-[#777]">#{message.id}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[#f0f0f0] overflow-hidden rounded-lg border border-[#f0f0f0]">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
              <dt className="shrink-0 text-sm font-medium text-[#666]">{row.label}</dt>
              <dd className="rich-text-editor-content text-sm text-primary sm:max-w-[65%] sm:text-start" dir={row.label === "البريد الإلكتروني" ? "ltr" : undefined}>
                {"html" in row && row.html ? <div dangerouslySetInnerHTML={{ __html: row.value }} /> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function ReplyMessageDialog({
  message,
  open,
  onClose,
  onSubmit,
  isLoading,
  submitError,
}: {
  message: ContactMessage | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (reply: string) => void;
  isLoading: boolean;
  submitError: string;
}) {
  const titleId = useId();
  const replyFieldId = useId();
  const [reply, setReply] = useState(message?.adminReply ?? "");
  const [formError, setFormError] = useState("");
  const error = formError || submitError;

  useDialogLock(open, onClose);

  if (!open || !message) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const trimmed = reply.trim();
    if (isRichTextEmpty(trimmed)) {
      setFormError("اكتب محتوى الرد قبل الإرسال.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق نافذة الرد" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" disabled={isLoading} onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              رد على الرسالة
            </h2>
            <p className="mt-1 text-sm text-[#777]">
              إلى: <span dir="ltr">{message.email}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={isLoading} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary disabled:cursor-not-allowed disabled:opacity-60" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-primary/10 bg-primary-light/40 px-4 py-3 text-sm">
          <p className="font-medium text-primary">{message.fullName}</p>
          <p className="mt-1 text-gray-600">الموضوع: {message.subject}</p>
          <p className="mt-2 text-gray-700">{message.message}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor={replyFieldId} className="mb-1.5 block text-sm font-medium text-primary">
              نص الرد
            </label>
            <RichTextEditor
              id={replyFieldId}
              value={reply}
              onChange={(html) => {
                setReply(html);
                if (formError) setFormError("");
              }}
              placeholder="اكتب ردك هنا..."
              disabled={isLoading}
              invalid={Boolean(error)}
              describedBy={error ? `${replyFieldId}-error` : undefined}
            />
            {error ? (
              <p id={`${replyFieldId}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onClose} disabled={isLoading} className="rounded-lg border border-primary/15 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
              إلغاء
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
              <Reply className="size-3.5" aria-hidden="true" />
              {isLoading ? "جاري الإرسال..." : "إرسال الرد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactMessagesPage() {
  const { data, isLoading, isFetching, isError, refetch } = useGetAllContactMessagesQuery();
  const [replyContactMessage, { isLoading: isReplying }] = useReplyContactMessageMutation();
  const [deleteContactMessage, { isLoading: isDeleting }] = useDeleteContactMessageMutation();

  const messages = data?.data ?? EMPTY_MESSAGES;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const selectedMessage = messages.find((item) => item.id === selectedId) ?? null;
  const replyMessage = messages.find((item) => item.id === replyId) ?? null;

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteContactMessage(deleteTarget.id).unwrap();
      if (selectedId === deleteTarget.id) setSelectedId(null);
      if (replyId === deleteTarget.id) setReplyId(null);
      setDeleteTarget(null);
      setSuccessMessage(result.message || "تم حذف الرسالة بنجاح");
      setSuccessOpen(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الرسالة، حاول مرة أخرى.");
    }
  };

  const handleReplySubmit = async (reply: string) => {
    if (!replyId || isReplying) return;

    setReplyError("");

    try {
      const result = await replyContactMessage({ id: replyId, reply }).unwrap();
      setReplyId(null);
      setSuccessMessage(result.message || "تم إرسال الرد إلى البريد الإلكتروني بنجاح.");
      setSuccessOpen(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setReplyError(errorData?.errors?.reply?.[0] || errorData?.message || "تعذر إرسال الرد، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">تواصل معنا</h1>
            <p className="mt-1 text-sm text-gray-600">الرسائل الواردة من نموذج صفحة التواصل في الموقع.</p>
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
            <p className="text-xs text-gray-500">إجمالي الرسائل</p>
            <p className="text-lg font-bold text-primary">{isLoading ? "—" : messages.length}</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-primary/10 bg-white p-6 shadow-sm" aria-busy="true">
          <p className="text-sm text-gray-500">جاري تحميل الرسائل...</p>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-10 animate-pulse rounded-lg bg-primary-light/60" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الرسائل</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? "جاري المحاولة..." : "إعادة المحاولة"}
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد رسائل حالياً</p>
          <p className="mt-1 text-xs text-gray-500">ستظهر هنا الرسائل المرسلة من صفحة التواصل</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="جدول رسائل التواصل (قابل للتمرير أفقياً)">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-start text-xs font-semibold uppercase tracking-wide text-primary">
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الرقم
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الاسم كامل
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    البريد الإلكتروني
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الموضوع
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الرسالة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    التاريخ
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الحالة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {messages.map((item) => (
                  <tr key={item.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-primary sm:px-6">#{item.id}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{item.fullName}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6" dir="ltr">
                      {item.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{item.subject}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">{item.message}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">{formatMessageDate(item.date)}</td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${contactStatusClass(item.status)}`}>
                        {formatContactStatus(item.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm" role="group" aria-label={`إجراءات الرسالة ${item.id}`}>
                        <button
                          type="button"
                          title="تفاصيل"
                          aria-label={`عرض تفاصيل الرسالة ${item.id}`}
                          onClick={() => setSelectedId(item.id)}
                          className="inline-flex size-8 items-center justify-center text-primary transition hover:bg-primary-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="h-4 w-px bg-primary/10" aria-hidden="true" />
                        <button
                          type="button"
                          title="رد"
                          aria-label={`الرد على الرسالة ${item.id}`}
                          onClick={() => {
                            setReplyError("");
                            setReplyId(item.id);
                          }}
                          className="inline-flex size-8 items-center justify-center text-secondary transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                        >
                          <Reply className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="h-4 w-px bg-primary/10" aria-hidden="true" />
                        <button
                          type="button"
                          title="حذف"
                          aria-label={`حذف الرسالة ${item.id}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(item);
                          }}
                          className="inline-flex size-8 items-center justify-center text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MessageDetailsDialog message={selectedMessage} open={selectedId !== null} onClose={() => setSelectedId(null)} />
      <ReplyMessageDialog
        key={replyId ?? "closed"}
        message={replyMessage}
        open={replyId !== null}
        onClose={() => {
          if (isReplying) return;
          setReplyId(null);
          setReplyError("");
        }}
        onSubmit={handleReplySubmit}
        isLoading={isReplying}
        submitError={replyError}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الرسالة"
        message={deleteTarget ? `هل تريد حذف رسالة «${deleteTarget.fullName}»؟ لا يمكن التراجع عن هذا الإجراء.` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setDeleteError("");
        }}
      />
      <SuccessToast open={successOpen} title="تم بنجاح" message={successMessage} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

export default ContactMessagesPage;
