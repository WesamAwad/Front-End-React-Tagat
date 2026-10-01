import { type FormEvent, useState } from "react";
import { Check, ListPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import SuccessToast from "../../../components/SuccessToast";
import {
  useDeleteShopFeatureMutation,
  useGetAllShopFeaturesQuery,
  useGetShopProfileQuery,
  useStoreShopFeatureMutation,
  useUpdateShopFeatureMutation,
} from "../../auth/authApi";
import type { AuthValidationErrorResponse, ShopFeature } from "../../../types/authTypes";

const EMPTY_FEATURES: ShopFeature[] = [];

function SpecsWorkshopPage() {
  const { data: profileData, isLoading: isProfileLoading } = useGetShopProfileQuery();
  const shopId = profileData?.data?.id ?? "";

  const { data: featuresData, isLoading: isFeaturesLoading, isFetching: isFeaturesFetching, isError: isFeaturesError } = useGetAllShopFeaturesQuery();
  const [storeShopFeature, { isLoading: isStoring }] = useStoreShopFeatureMutation();
  const [updateShopFeature, { isLoading: isUpdating }] = useUpdateShopFeatureMutation();
  const [deleteShopFeature, { isLoading: isDeleting }] = useDeleteShopFeatureMutation();

  const allFeatures = featuresData?.data ?? EMPTY_FEATURES;
  const specs = shopId ? allFeatures.filter((item) => !item.shop_id || item.shop_id === shopId) : allFeatures;

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ShopFeature | null>(null);
  const [formError, setFormError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isSaving = isStoring || isUpdating;
  const isListLoading = isProfileLoading || isFeaturesLoading;

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setSubmitError("");

    const feature = draft.trim();
    if (!feature) {
      setFormError("أدخل نص المواصفة");
      return;
    }
    if (!shopId) {
      setSubmitError("تعذر تحديد الورشة. أكمل البروفايل أولاً.");
      return;
    }

    try {
      const result = await storeShopFeature({ feature, shop_id: shopId }).unwrap();
      setDraft("");
      setSuccessMessage(result.message || "تمت إضافة المواصفة بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.feature?.[0]) {
        setFormError(errors.feature[0]);
        return;
      }
      if (errors?.shop_id?.[0]) {
        setSubmitError(errors.shop_id[0]);
        return;
      }

      setSubmitError(errorData?.message || "تعذر إضافة المواصفة، حاول مرة أخرى.");
    }
  };

  const startEdit = (spec: ShopFeature) => {
    setEditingId(spec.id);
    setEditDraft(spec.feature);
    setFormError("");
    setSubmitError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
    setFormError("");
  };

  const saveEdit = async (specId: string) => {
    setFormError("");
    setSubmitError("");

    const feature = editDraft.trim();
    if (!feature) {
      setFormError("أدخل نص المواصفة");
      return;
    }
    if (!shopId) {
      setSubmitError("تعذر تحديد الورشة. أكمل البروفايل أولاً.");
      return;
    }

    try {
      const result = await updateShopFeature({ id: specId, feature, shop_id: shopId }).unwrap();
      setEditingId(null);
      setEditDraft("");
      setSuccessMessage(result.message || "تم تعديل المواصفة بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.feature?.[0]) {
        setFormError(errors.feature[0]);
        return;
      }

      setSubmitError(errorData?.message || "تعذر تعديل المواصفة، حاول مرة أخرى.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteShopFeature(deleteTarget.id).unwrap();
      if (editingId === deleteTarget.id) cancelEdit();
      setDeleteTarget(null);
      setSuccessMessage(result.message || "تم حذف المواصفة بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف المواصفة، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <SuccessToast open={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />

      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ffefe4]">
            <ListPlus className="size-5 text-secondary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">إضافة المواصفات</h1>
            <p className="mt-1 text-sm text-label">أضف مواصفات تظهر في قسم «لماذا تختار هذه الورشة؟»</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <label htmlFor="spec-draft" className="mb-2 block text-sm font-medium text-label">
              مواصفة جديدة
            </label>
            <input
              id="spec-draft"
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (formError) setFormError("");
                if (submitError) setSubmitError("");
              }}
              disabled={isListLoading || isSaving || !shopId}
              placeholder={isListLoading ? "جاري التحميل..." : "مثال: ضمان على قطع الغيار"}
              className="w-full rounded-lg border border-primary/15 px-4 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-70"
            />
            {formError && !editingId ? <p className="mt-1.5 text-sm text-red-600">{formError}</p> : null}
          </div>
          <button
            type="submit"
            disabled={isListLoading || isSaving || !shopId || !draft.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7"
          >
            <Plus className="size-4" aria-hidden="true" />
            {isStoring ? "جاري الإضافة..." : "إضافة"}
          </button>
        </form>

        {submitError && !editingId ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {submitError}
          </p>
        ) : null}

        {!isProfileLoading && !shopId ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
            أكمل بروفايل الورشة أولاً حتى تتمكن من إدارة المواصفات.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-primary">المواصفات الحالية</h2>
          {isFeaturesFetching && !isFeaturesLoading ? <span className="text-xs text-primary/50">جاري التحديث...</span> : null}
        </div>

        {isFeaturesLoading ? (
          <p className="rounded-lg bg-primary-light/40 px-4 py-6 text-center text-sm text-primary/60" role="status">
            جاري تحميل المواصفات...
          </p>
        ) : isFeaturesError ? (
          <p className="rounded-lg bg-red-50 px-4 py-6 text-center text-sm text-red-700" role="alert">
            تعذر تحميل المواصفات. حاول تحديث الصفحة.
          </p>
        ) : specs.length === 0 ? (
          <p className="rounded-lg bg-primary-light/40 px-4 py-6 text-center text-sm text-primary/60">لا توجد مواصفات بعد. أضف أول مواصفة من الحقل أعلاه.</p>
        ) : (
          <ul className="space-y-3">
            {specs.map((spec) => {
              const isEditing = editingId === spec.id;

              return (
                <li key={spec.id} className="rounded-xl border border-primary/10 bg-[#fafafa] px-4 py-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={editDraft}
                        onChange={(event) => {
                          setEditDraft(event.target.value);
                          if (formError) setFormError("");
                          if (submitError) setSubmitError("");
                        }}
                        aria-label="تعديل المواصفة"
                        disabled={isUpdating}
                        className="min-w-0 flex-1 rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm text-primary outline-none transition focus:border-primary disabled:opacity-70"
                        autoFocus
                      />
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(spec.id)}
                          disabled={isUpdating || !editDraft.trim()}
                          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                          {isUpdating ? "جاري الحفظ..." : "حفظ"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/15 bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary-light disabled:opacity-50"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex min-w-0 items-start gap-2 text-sm text-primary">
                        <span className="mt-0.5 font-bold text-secondary" aria-hidden="true">
                          ✓
                        </span>
                        <span className="wrap-break-words">{spec.feature}</span>
                      </p>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          aria-label={`تعديل: ${spec.feature}`}
                          onClick={() => startEdit(spec)}
                          disabled={isSaving || isDeleting}
                          className="rounded-lg p-2 text-primary/60 transition hover:bg-primary-light hover:text-primary disabled:opacity-50"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف: ${spec.feature}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(spec);
                          }}
                          disabled={isSaving || isDeleting}
                          className="rounded-lg p-2 text-red-500/80 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                  {isEditing && formError ? <p className="mt-2 text-sm text-red-600">{formError}</p> : null}
                  {isEditing && submitError ? <p className="mt-2 text-sm text-red-600">{submitError}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف المواصفة"
        message={deleteTarget ? `هل تريد حذف «${deleteTarget.feature}»؟` : ""}
        confirmLabel={isDeleting ? "جاري الحذف..." : "حذف"}
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
    </div>
  );
}

export default SpecsWorkshopPage;
