import { useEffect, useId, useState, type FormEvent } from "react";
import { Eye, Flag, Reply, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { isRichTextEmpty } from "../../../components/richText";
import SuccessToast from "../../../components/SuccessToast";
import type { AuthValidationErrorResponse, Complaint } from "../../../types/authTypes";
import { useDeleteComplaintMutation, useGetAllComplaintsQuery, useReplyComplaintMutation } from "../../auth/authApi";

const EMPTY_COMPLAINTS: Complaint[] = [];

function formatComplaintStatus(status: string, statusName?: string) {
  if (statusName?.trim()) return statusName.trim();
  const key = status.trim().toLowerCase();
  if (key === "replied") return "تم الرد";
  if (key === "pending") return "قيد الانتظار";
  return status.trim() || "—";
}

function complaintStatusClass(status: string) {
  const key = status.trim().toLowerCase();
  if (key === "replied") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (key === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}

function formatComplaintDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
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

function ComplaintDetailsDialog({
  complaint,
  open,
  onClose,
}: {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  useDialogLock(open, onClose);

  if (!open || !complaint) return null;

  const rows = [
    { label: "الزبون", value: complaint.customer?.name || "—" },
    { label: "البريد الإلكتروني", value: complaint.customer?.email || "—" },
    { label: "الورشة", value: complaint.shop?.name || "—" },
    { label: "الموضوع", value: complaint.subject || "—" },
    { label: "الرسالة", value: complaint.message || "—", html: true },
    { label: "التاريخ", value: formatComplaintDate(complaint.created_at) },
    { label: "الحالة", value: formatComplaintStatus(complaint.status, complaint.status_name) },
    ...(complaint.admin_reply
      ? [
          { label: "رد الأدمن", value: complaint.admin_reply, html: true },
          { label: "تاريخ الرد", value: formatComplaintDate(complaint.replied_at) },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق تفاصيل الشكوى" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              تفاصيل الشكوى
            </h2>
            <p className="mt-1 text-sm text-[#777]">#{complaint.id}</p>
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

function ReplyComplaintDialog({
  complaint,
  open,
  onClose,
  onSubmit,
  isLoading,
  submitError,
}: {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (reply: string) => void;
  isLoading: boolean;
  submitError: string;
}) {
  const titleId = useId();
  const replyFieldId = useId();
  const [reply, setReply] = useState("");
  const [formError, setFormError] = useState("");
  const error = formError || submitError;

  useDialogLock(open, () => {
    if (isLoading) return;
    setReply("");
    setFormError("");
    onClose();
  });

  if (!open || !complaint) return null;

  const handleClose = () => {
    if (isLoading) return;
    setReply("");
    setFormError("");
    onClose();
  };

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
      <button type="button" aria-label="إغلاق نافذة الرد" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" disabled={isLoading} onClick={handleClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              رد على الشكوى
            </h2>
            <p className="mt-1 text-sm text-[#777]">
              إلى: <span dir="ltr">{complaint.customer?.email || "—"}</span>
            </p>
          </div>
          <button type="button" onClick={handleClose} disabled={isLoading} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary disabled:opacity-60" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-primary/10 bg-primary-light/40 px-4 py-3 text-sm">
          <p className="font-medium text-primary">{complaint.customer?.name || "زبون"}</p>
          <p className="mt-1 text-gray-600">الورشة: {complaint.shop?.name || "—"}</p>
          <p className="mt-1 text-gray-600">الموضوع: {complaint.subject}</p>
          <div className="rich-text-editor-content mt-2 text-gray-700" dangerouslySetInnerHTML={{ __html: complaint.message }} />
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
              placeholder="اكتب ردك هنا... سيُرسل إلى بريد الزبون"
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
            <button type="button" onClick={handleClose} disabled={isLoading} className="rounded-lg border border-primary/15 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60">
              إلغاء
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-60">
              <Reply className="size-3.5" aria-hidden="true" />
              {isLoading ? "جاري الإرسال..." : "إرسال الرد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComplaintsPage() {
  const { data, isLoading, isFetching, isError, refetch } = useGetAllComplaintsQuery();
  const [replyComplaint, { isLoading: isReplying }] = useReplyComplaintMutation();
  const [deleteComplaint, { isLoading: isDeleting }] = useDeleteComplaintMutation();

  const complaints = data?.data ?? EMPTY_COMPLAINTS;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedComplaint = complaints.find((item) => item.id === selectedId) ?? null;
  const replyComplaintItem = complaints.find((item) => item.id === replyId) ?? null;

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteComplaint(deleteTarget.id).unwrap();
      if (selectedId === deleteTarget.id) setSelectedId(null);
      if (replyId === deleteTarget.id) setReplyId(null);
      setDeleteTarget(null);
      setSuccessMessage(result.message || "تم حذف الشكوى بنجاح.");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الشكوى، حاول مرة أخرى.");
    }
  };

  const submitReply = async (admin_reply: string) => {
    if (!replyComplaintItem || isReplying) return;

    setReplyError("");

    try {
      const result = await replyComplaint({ id: replyComplaintItem.id, admin_reply }).unwrap();
      setReplyId(null);
      setSuccessMessage(result.message || "تم الرد على الشكوى وإرسال الرد إلى البريد الإلكتروني.");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setReplyError(errorData?.message || errorData?.errors?.admin_reply?.[0] || "تعذر إرسال الرد، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary">شكاوى الورش</h1>
        <p className="mt-1 text-sm text-gray-500">عرض شكاوى الزبائن والرد عليها عبر البريد الإلكتروني</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-primary/70" role="status">
            جاري تحميل الشكاوى...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الشكاوى</p>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60">
            {isFetching ? "جاري المحاولة..." : "إعادة المحاولة"}
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <Flag className="mx-auto size-8 text-primary/30" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-primary">لا توجد شكاوى حالياً</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          {isFetching ? (
            <p className="border-b border-primary/10 bg-primary-light/40 px-4 py-2 text-center text-xs text-primary/70" role="status">
              جاري تحديث القائمة...
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-220 w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-center text-xs font-semibold text-primary">
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5">
                    الزبون
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5">
                    الورشة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5">
                    الموضوع
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5">
                    التاريخ
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5">
                    الحالة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-800">
                      <div>
                        <p className="font-medium">{complaint.customer?.name || "—"}</p>
                        <p className="text-xs text-gray-500" dir="ltr">
                          {complaint.customer?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-700">{complaint.shop?.name || "—"}</td>
                    <td className="max-w-48 truncate px-4 py-4 text-center text-gray-700" title={complaint.subject}>
                      {complaint.subject || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600">{formatComplaintDate(complaint.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${complaintStatusClass(complaint.status)}`}>
                        {formatComplaintStatus(complaint.status, complaint.status_name)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`عرض الشكوى ${complaint.id}`}
                          onClick={() => setSelectedId(complaint.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                          عرض
                        </button>
                        <button
                          type="button"
                          aria-label={`الرد على الشكوى ${complaint.id}`}
                          onClick={() => {
                            setReplyError("");
                            setReplyId(complaint.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/30 bg-white px-3 py-1.5 text-xs font-medium text-secondary transition hover:bg-orange-50"
                        >
                          <Reply className="size-3.5" aria-hidden="true" />
                          رد
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف الشكوى ${complaint.id}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(complaint);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          حذف
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

      <ComplaintDetailsDialog complaint={selectedComplaint} open={Boolean(selectedComplaint)} onClose={() => setSelectedId(null)} />

      <ReplyComplaintDialog
        key={replyId ?? "reply-closed"}
        complaint={replyComplaintItem}
        open={Boolean(replyComplaintItem)}
        onClose={() => {
          if (isReplying) return;
          setReplyError("");
          setReplyId(null);
        }}
        onSubmit={(reply) => void submitReply(reply)}
        isLoading={isReplying}
        submitError={replyError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الشكوى"
        message={deleteTarget ? `هل تريد حذف شكوى «${deleteTarget.subject}»؟` : ""}
        confirmLabel="حذف"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteError("");
          setDeleteTarget(null);
        }}
      />

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );
}

export default ComplaintsPage;
